import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

/**
 * @desc    Mark a student's attendance via a real-time RFID scan
 * @route   POST /api/attendance/mark
 * @access  Public (for hardware)
 */
const markAttendance = async (req, res) => {
  const { uid, timestamp } = req.body; // Now expecting timestamp as well

  if (!uid) {
    return res.status(400).json({ message: 'Error: UID is required.' });
  }

  try {
    const student = await User.findOne({ uid: uid, role: 'student' });

    if (!student) {
      return res.status(404).send('Student not registered.');
    }

    // Use the timestamp from the ESP if provided, otherwise use current time.
    // Set to the start of the day for consistency.
    const attendanceDate = timestamp ? new Date(timestamp) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const newAttendance = new Attendance({
      student: student._id,
      schoolId: student.schoolId,
      date: attendanceDate,
    });
    await newAttendance.save();

    res.status(200).send(`Present: ${student.name}`);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).send('Already marked present.');
    }
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Server error while marking attendance.' });
  }
};

/**
 * @desc    Sync a batch of offline attendance logs from the hardware
 * @route   POST /api/attendance/sync-logs
 * @access  Public (for hardware)
 */
const syncOfflineAttendance = async (req, res) => {
  // The ESP sends the entire file content as plain text in the body
  const logData = req.body;

  if (!logData || typeof logData !== 'string' || logData.trim() === '') {
    return res.status(400).json({ message: 'Log data is empty or invalid.' });
  }
  
  console.log('--- Received a BATCH of offline logs to sync ---');
  console.log(logData);

  const logs = logData.trim().split('\n');
  let successCount = 0;
  let errorCount = 0;

  // Process each log entry one by one
  for (const log of logs) {
    const [uid, timestamp] = log.split(',');
    if (!uid || !timestamp) {
      errorCount++;
      continue; // Skip malformed lines
    }

    try {
      const student = await User.findOne({ uid: uid.trim(), role: 'student' });
      if (!student) {
        errorCount++;
        console.log(`Sync error: Student with UID ${uid.trim()} not found.`);
        continue;
      }
      
      const attendanceDate = new Date(timestamp.trim());
      attendanceDate.setHours(0, 0, 0, 0);

      // Create a new attendance record, but ignore duplicates
      await Attendance.updateOne(
        { student: student._id, date: attendanceDate },
        { $setOnInsert: { schoolId: student.schoolId, student: student._id, date: attendanceDate } },
        { upsert: true } // This creates the doc if it doesn't exist, otherwise does nothing
      );
      successCount++;
    } catch (err) {
      errorCount++;
      console.error(`Error processing log entry "${log}":`, err);
    }
  }
  
  console.log(`Sync complete. Success: ${successCount}, Failed: ${errorCount}`);
  res.status(200).json({ 
    message: 'Sync process finished.',
    successCount,
    errorCount,
  });
};


/**
 * @desc    Get today's attendance for a specific school
 * @route   GET /api/attendance/today/:schoolId
 * @access  Private (should be protected by teacher role)
 */
const getTodaysAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceRecords = await Attendance.find({
      schoolId: req.params.schoolId,
      date: today,
    }).populate('student', 'name');

    res.json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    res.status(500).json({ message: 'Server error while fetching attendance.' });
  }
};

export { markAttendance, getTodaysAttendance, syncOfflineAttendance };

