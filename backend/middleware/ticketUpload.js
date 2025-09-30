import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import logger from '../utils/logger.js'

// Enhanced upload directory with proper permissions
const uploadDir = path.resolve('uploads/tickets')

// Ensure upload directory exists with proper permissions
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 })
}

// Enhanced storage configuration with security features
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectory based on ticket ID or user ID for organization
    const ticketId = req.params._id || 'temp'
    const userSubDir = path.join(uploadDir, ticketId)

    if (!fs.existsSync(userSubDir)) {
      fs.mkdirSync(userSubDir, { recursive: true, mode: 0o755 })
    }

    cb(null, userSubDir)
  },
  filename: (req, file, cb) => {
    // Generate secure filename with hash to prevent conflicts and path traversal
    const ext = path.extname(file.originalname).toLowerCase()
    const sanitizedName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Remove special characters
      .substring(0, 50) // Limit name length

    // Generate unique hash for security
    const hash = crypto.randomBytes(16).toString('hex')
    const timestamp = Date.now()
    const filename = `${timestamp}-${hash}-${sanitizedName}${ext}`

    cb(null, filename)
  }
})

// Strict file type validation with security considerations
const allowedExtensions = /^\.(jpeg|jpg|png|pdf|doc|docx|xls|xlsx|txt|csv)$/i
const allowedMimeTypes = [
  // Images
  'image/jpeg',
  'image/png',
  'image/jpg',

  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'application/csv'
]

// Dangerous file extensions to block
const dangerousExtensions =
  /^\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|php|asp|aspx|jsp|sh|ps1|py|rb|pl|sql|sqlite|db|mdb)$/i

// Dangerous MIME types to block
const dangerousMimeTypes = [
  'application/x-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-msdos-windows',
  'application/x-winexe',
  'application/x-javascript',
  'application/javascript',
  'text/javascript',
  'application/x-php',
  'application/x-httpd-php',
  'application/x-sh',
  'application/x-powershell'
]

/**
 * Validate file content by reading file headers
 * @param {string} filePath - Path to the uploaded file
 * @param {string} expectedExt - Expected file extension
 * @returns {Promise<boolean>} - Whether file content matches extension
 */
const validateFileContent = async (filePath, expectedExt) => {
  try {
    const fileBuffer = fs.readFileSync(filePath, { start: 0, end: 1023 }) // Read first 1KB

    // File signature validation
    const signatures = {
      '.jpg': [0xff, 0xd8, 0xff],
      '.jpeg': [0xff, 0xd8, 0xff],
      '.png': [0x89, 0x50, 0x4e, 0x47],
      '.pdf': [0x25, 0x50, 0x44, 0x46],
      '.doc': [0xd0, 0xcf, 0x11, 0xe0],
      '.docx': [0x50, 0x4b, 0x03, 0x04],
      '.xls': [0xd0, 0xcf, 0x11, 0xe0],
      '.xlsx': [0x50, 0x4b, 0x03, 0x04],
      '.txt': null, // Text files don't have consistent signatures
      '.csv': null // CSV files don't have consistent signatures
    }

    const signature = signatures[expectedExt.toLowerCase()]
    if (signature) {
      return signature.every((byte, index) => fileBuffer[index] === byte)
    }

    // For text-based files, check if content is readable
    if (['.txt', '.csv'].includes(expectedExt.toLowerCase())) {
      const content = fileBuffer.toString('utf8')
      return content.length > 0 && !content.includes('\0') // No null bytes
    }

    return true
  } catch (error) {
    logger.error('File content validation error:', error)
    return false
  }
}

/**
 * Enhanced file filter with comprehensive security checks
 */
const fileFilter = async (req, file, cb) => {
  try {
    const ext = path.extname(file.originalname).toLowerCase()

    // Log upload attempt for security monitoring
    logger.info('File upload attempt', {
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      extension: ext,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })

    // Check for dangerous extensions
    if (dangerousExtensions.test(ext)) {
      logger.warn('Upload blocked: Dangerous file extension', {
        filename: file.originalname,
        extension: ext,
        userId: req.user?.id,
        ip: req.ip
      })
      return cb(new Error('File type not allowed for security reasons'), false)
    }

    // Check for dangerous MIME types
    if (dangerousMimeTypes.includes(file.mimetype)) {
      logger.warn('Upload blocked: Dangerous MIME type', {
        filename: file.originalname,
        mimetype: file.mimetype,
        userId: req.user?.id,
        ip: req.ip
      })
      return cb(new Error('File type not allowed for security reasons'), false)
    }

    // Validate allowed extensions
    if (!allowedExtensions.test(ext)) {
      logger.warn('Upload blocked: Unsupported file extension', {
        filename: file.originalname,
        extension: ext,
        userId: req.user?.id,
        ip: req.ip
      })
      return cb(
        new Error(
          'Unsupported file type. Allowed types: jpg, jpeg, png, pdf, doc, docx, xls, xlsx, txt, csv'
        ),
        false
      )
    }

    // Validate MIME types
    if (!allowedMimeTypes.includes(file.mimetype)) {
      logger.warn('Upload blocked: Unsupported MIME type', {
        filename: file.originalname,
        mimetype: file.mimetype,
        userId: req.user?.id,
        ip: req.ip
      })
      return cb(new Error('Unsupported file format'), false)
    }

    // Check file size (individual file limit)
    const maxFileSize = 10 * 1024 * 1024 // 10 MB per file
    if (file.size > maxFileSize) {
      logger.warn('Upload blocked: File too large', {
        filename: file.originalname,
        size: file.size,
        maxSize: maxFileSize,
        userId: req.user?.id,
        ip: req.ip
      })
      return cb(
        new Error(
          `File size exceeds limit. Maximum size: ${maxFileSize / (1024 * 1024)} MB`
        ),
        false
      )
    }

    // Check filename for suspicious patterns
    const suspiciousPatterns = [
      /\.\./, // Path traversal
      /[<>:"|?*]/, // Invalid characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
      /^(\.|\.\.)$/, // Hidden files
      /\.(exe|bat|cmd|com|pif|scr|vbs|js)$/i // Executable extensions
    ]

    const hasSuspiciousPattern = suspiciousPatterns.some((pattern) =>
      pattern.test(file.originalname)
    )

    if (hasSuspiciousPattern) {
      logger.warn('Upload blocked: Suspicious filename pattern', {
        filename: file.originalname,
        userId: req.user?.id,
        ip: req.ip
      })
      return cb(new Error('Invalid filename'), false)
    }

    logger.info('File upload approved', {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      userId: req.user?.id
    })

    cb(null, true)
  } catch (error) {
    logger.error('File filter error:', error)
    cb(new Error('File validation error'), false)
  }
}

// Enhanced multer configuration with comprehensive security
const ticketUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 5, // Maximum 5 files
    fieldSize: 1024 * 1024, // 1 MB for field values
    fieldNameSize: 100, // Maximum field name length
    fields: 10 // Maximum number of fields
  },
  fileFilter,
  preservePath: false, // Don't preserve full path for security
  onError: (err, next) => {
    logger.error('Multer upload error:', err)
    next(err)
  }
})

/**
 * Middleware to validate uploaded files after multer processing
 */
const validateUploadedFiles = (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      })
    }

    // Additional validation for each uploaded file
    const validationPromises = req.files.map(async (file) => {
      const ext = path.extname(file.originalname).toLowerCase()
      const isValidContent = await validateFileContent(file.path, ext)

      if (!isValidContent) {
        // Clean up invalid file
        try {
          fs.unlinkSync(file.path)
        } catch (cleanupError) {
          logger.error('Error cleaning up invalid file:', cleanupError)
        }

        throw new Error(
          `File content does not match extension: ${file.originalname}`
        )
      }

      return {
        ...file,
        uploadedAt: new Date(),
        uploadedBy: req.user?.id,
        fileSize: file.size,
        mimeType: file.mimetype,
        originalName: file.originalname,
        sanitizedName: file.filename
      }
    })

    Promise.all(validationPromises)
      .then((validatedFiles) => {
        req.validatedFiles = validatedFiles

        logger.info('Files uploaded successfully', {
          count: validatedFiles.length,
          userId: req.user?.id,
          ticketId: req.params._id,
          files: validatedFiles.map((f) => ({
            originalName: f.originalName,
            size: f.fileSize,
            type: f.mimeType
          }))
        })

        next()
      })
      .catch((error) => {
        logger.error('File validation failed:', error)
        return res.status(400).json({
          success: false,
          message: error.message
        })
      })
  } catch (error) {
    logger.error('Upload validation error:', error)
    return res.status(500).json({
      success: false,
      message: 'File upload validation error'
    })
  }
}

/**
 * Cleanup middleware to remove orphaned files on error
 */
const cleanupOnError = (req, res, next) => {
  // Store original next function
  const originalNext = next

  // Override next to handle cleanup
  req.next = function (err) {
    if (err && req.files) {
      // Clean up uploaded files on error
      req.files.forEach((file) => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path)
            logger.info('Cleaned up orphaned file:', file.path)
          }
        } catch (cleanupError) {
          logger.error('Error cleaning up file:', cleanupError)
        }
      })
    }
    originalNext(err)
  }

  next()
}

export default ticketUpload
export { validateUploadedFiles, cleanupOnError }
