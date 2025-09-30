/**
 * @fileoverview Employee File Upload Configuration for EMS Backend
 * @description Enhanced multer configuration for secure employee file uploads with comprehensive
 * security features, validation, and error handling. Provides secure file upload middleware
 * for employee documents with advanced security checks and monitoring capabilities.
 *
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 *
 * @features
 * - Secure file upload with multer middleware
 * - Comprehensive file type validation and security checks
 * - File signature validation to prevent file spoofing
 * - Dangerous file extension and MIME type blocking
 * - Path traversal and injection attack prevention
 * - File size and count limits for security
 * - Suspicious filename pattern detection
 * - Automatic file cleanup on errors
 * - Comprehensive logging and monitoring
 * - Employee-specific directory organization
 * - Secure filename generation with hashing
 * - Upload statistics and health monitoring
 */

// Import multer for file upload handling
import multer from 'multer'
// Import path utilities for file path management
import path from 'path'
// Import file system utilities for directory operations
import fs from 'fs'
// Import crypto for secure filename generation
import crypto from 'crypto'
// Import custom logger for comprehensive logging
import logger from './logger.js'

// Enhanced upload directory with proper permissions for employee files
const uploadDir = path.resolve('uploads/employees')

// Ensure upload directory exists with proper permissions for security
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 })
}

/**
 * Enhanced storage configuration with comprehensive security features
 * 
 * @description Configures multer disk storage with employee-specific directories,
 * secure filename generation, and path traversal protection for secure file uploads.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectory based on employee ID or user ID for organization
    const employeeId = req.params.id || req.body.employeeId || 'temp'
    const employeeSubDir = path.join(uploadDir, employeeId)

    // Ensure employee-specific directory exists with proper permissions
    if (!fs.existsSync(employeeSubDir)) {
      fs.mkdirSync(employeeSubDir, { recursive: true, mode: 0o755 })
    }

    cb(null, employeeSubDir)
  },
  filename: (req, file, cb) => {
    // Generate secure filename with hash to prevent conflicts and path traversal
    const ext = path.extname(file.originalname).toLowerCase()
    const sanitizedName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Remove special characters for security
      .substring(0, 50) // Limit name length to prevent issues

    // Generate unique hash for security and conflict prevention
    const hash = crypto.randomBytes(16).toString('hex')
    const timestamp = Date.now()
    const filename = `${file.fieldname}-${timestamp}-${hash}-${sanitizedName}${ext}`

    cb(null, filename)
  }
})

/**
 * Strict file type validation with security considerations for employee documents
 * 
 * @description Defines allowed file extensions and MIME types for secure file uploads,
 * along with dangerous file types that should be blocked for security.
 */
const allowedExtensions = /^\.(jpeg|jpg|png|pdf|doc|docx|xls|xlsx|txt)$/i
const allowedMimeTypes = [
  // Image file types for employee photos and documents
  'image/jpeg',
  'image/png',
  'image/jpg',

  // Document file types for employee records
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
]

/**
 * Dangerous file extensions to block for security
 * 
 * @description Regex pattern for file extensions that pose security risks
 * including executables, scripts, and database files.
 */
const dangerousExtensions =
  /^\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|php|asp|aspx|jsp|sh|ps1|py|rb|pl|sql|sqlite|db|mdb)$/i

/**
 * Dangerous MIME types to block for security
 * 
 * @description Array of MIME types that pose security risks including
 * executables, scripts, and potentially malicious file types.
 */
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
 * Validate file content by reading file headers to prevent file spoofing
 * 
 * @async
 * @function validateFileContent
 * @param {string} filePath - Path to the uploaded file
 * @param {string} expectedExt - Expected file extension
 * @returns {Promise<boolean>} Whether file content matches the expected extension
 * 
 * @description Validates file content by checking file signatures (magic bytes)
 * to prevent file spoofing attacks where malicious files are disguised with
 * safe extensions. This provides an additional layer of security beyond
 * MIME type validation.
 * 
 * @example
 * // Validate uploaded file content
 * const isValid = await validateFileContent('/path/to/file.jpg', '.jpg');
 * if (!isValid) {
 *   // File content doesn't match extension
 * }
 */
const validateFileContent = async (filePath, expectedExt) => {
  try {
    // Read first 1KB of file to check file signature
    const fileBuffer = fs.readFileSync(filePath, { start: 0, end: 1023 })

    // File signature validation using magic bytes
    const signatures = {
      '.jpg': [0xff, 0xd8, 0xff],
      '.jpeg': [0xff, 0xd8, 0xff],
      '.png': [0x89, 0x50, 0x4e, 0x47],
      '.pdf': [0x25, 0x50, 0x44, 0x46],
      '.doc': [0xd0, 0xcf, 0x11, 0xe0],
      '.docx': [0x50, 0x4b, 0x03, 0x04],
      '.xls': [0xd0, 0xcf, 0x11, 0xe0],
      '.xlsx': [0x50, 0x4b, 0x03, 0x04],
      '.txt': null // Text files don't have consistent signatures
    }

    const signature = signatures[expectedExt.toLowerCase()]
    if (signature) {
      // Check if file signature matches expected format
      return signature.every((byte, index) => fileBuffer[index] === byte)
    }

    // For text-based files, check if content is readable and safe
    if (expectedExt.toLowerCase() === '.txt') {
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
 * 
 * @async
 * @function fileFilter
 * @param {Object} req - Express request object
 * @param {Object} file - Multer file object
 * @param {Function} cb - Multer callback function
 * 
 * @description Comprehensive file filter that performs multiple security checks
 * including dangerous file type detection, size validation, suspicious filename
 * pattern detection, and comprehensive logging for security monitoring.
 * 
 * @example
 * // File filter is used automatically by multer configuration
 * // No direct usage required - integrated into multer setup
 */
const fileFilter = async (req, file, cb) => {
  try {
    const ext = path.extname(file.originalname).toLowerCase()

    // Log upload attempt for security monitoring and audit trail
    logger.info('Employee file upload attempt', {
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      extension: ext,
      userId: req.user?.id,
      employeeId: req.params.id || req.body.employeeId,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })

    // Check for dangerous file extensions that pose security risks
    if (dangerousExtensions.test(ext)) {
      logger.warn('Employee upload blocked: Dangerous file extension', {
        filename: file.originalname,
        extension: ext,
        userId: req.user?.id,
        ip: req.ip
      })
      return cb(new Error('File type not allowed for security reasons'), false)
    }

    // Check for dangerous MIME types that could contain malicious content
    if (dangerousMimeTypes.includes(file.mimetype)) {
      logger.warn('Employee upload blocked: Dangerous MIME type', {
        filename: file.originalname,
        mimetype: file.mimetype,
        userId: req.user?.id,
        ip: req.ip
      })
      return cb(new Error('File type not allowed for security reasons'), false)
    }

    // Validate that file extension is in the allowed list
    if (!allowedExtensions.test(ext)) {
      logger.warn('Employee upload blocked: Unsupported file extension', {
        filename: file.originalname,
        extension: ext,
        userId: req.user?.id,
        ip: req.ip
      })
      return cb(
        new Error(
          'Unsupported file type. Allowed types: jpg, jpeg, png, pdf, doc, docx, xls, xlsx, txt'
        ),
        false
      )
    }

    // Validate that MIME type matches allowed types
    if (!allowedMimeTypes.includes(file.mimetype)) {
      logger.warn('Employee upload blocked: Unsupported MIME type', {
        filename: file.originalname,
        mimetype: file.mimetype,
        userId: req.user?.id,
        ip: req.ip
      })
      return cb(new Error('Unsupported file format'), false)
    }

    // Check file size against individual file limit for security
    const maxFileSize = 10 * 1024 * 1024 // 10 MB per file
    if (file.size > maxFileSize) {
      logger.warn('Employee upload blocked: File too large', {
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

    // Check filename for suspicious patterns that could indicate attacks
    const suspiciousPatterns = [
      /\.\./, // Path traversal attempts
      /[<>:"|?*]/, // Invalid characters for filenames
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
      /^(\.|\.\.)$/, // Hidden files and directory traversal
      /\.(exe|bat|cmd|com|pif|scr|vbs|js)$/i // Executable extensions
    ]

    const hasSuspiciousPattern = suspiciousPatterns.some((pattern) =>
      pattern.test(file.originalname)
    )

    if (hasSuspiciousPattern) {
      logger.warn('Employee upload blocked: Suspicious filename pattern', {
        filename: file.originalname,
        userId: req.user?.id,
        ip: req.ip
      })
      return cb(new Error('Invalid filename'), false)
    }

    // Log successful file approval for audit trail
    logger.info('Employee file upload approved', {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      userId: req.user?.id
    })

    cb(null, true)
  } catch (error) {
    logger.error('Employee file filter error:', error)
    cb(new Error('File validation error'), false)
  }
}

/**
 * Enhanced multer configuration with comprehensive security features
 * 
 * @description Configures multer with enhanced security settings including
 * file size limits, count limits, field limits, and comprehensive error handling
 * for secure employee file uploads.
 */
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file for security
    files: 10, // Maximum 10 files per request to prevent abuse
    fieldSize: 1024 * 1024, // 1 MB for field values to prevent memory issues
    fieldNameSize: 100, // Maximum field name length for security
    fields: 20 // Maximum number of fields to prevent form abuse
  },
  fileFilter,
  preservePath: false, // Don't preserve full path for security
  onError: (err, next) => {
    logger.error('Multer employee upload error:', err)
    next(err)
  }
})

/**
 * Middleware to validate uploaded files after multer processing
 * 
 * @function validateUploadedFiles
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description Validates uploaded files after multer processing by performing
 * additional content validation, file signature checks, and cleanup of invalid files.
 * Adds metadata to validated files for tracking and audit purposes.
 * 
 * @example
 * // Use as middleware after multer upload
 * app.post('/upload', upload.array('files'), validateUploadedFiles, (req, res) => {
 *   // Handle validated files
 * });
 */
const validateUploadedFiles = (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      })
    }

    // Additional validation for each uploaded file to ensure content integrity
    const validationPromises = req.files.map(async (file) => {
      const ext = path.extname(file.originalname).toLowerCase()
      // Validate file content against file signature to prevent spoofing
      const isValidContent = await validateFileContent(file.path, ext)

      if (!isValidContent) {
        // Clean up invalid file to prevent storage of malicious content
        try {
          fs.unlinkSync(file.path)
        } catch (cleanupError) {
          logger.error(
            'Error cleaning up invalid employee file:',
            cleanupError
          )
        }

        throw new Error(
          `File content does not match extension: ${file.originalname}`
        )
      }

      // Return enhanced file object with metadata for tracking and audit
      return {
        ...file,
        uploadedAt: new Date(),
        uploadedBy: req.user?.id,
        employeeId: req.params.id || req.body.employeeId,
        fileSize: file.size,
        mimeType: file.mimetype,
        originalName: file.originalname,
        sanitizedName: file.filename
      }
    })

    // Process all file validations and handle results
    Promise.all(validationPromises)
      .then((validatedFiles) => {
        // Attach validated files to request object for downstream processing
        req.validatedFiles = validatedFiles

        // Log successful file upload for audit trail
        logger.info('Employee files uploaded successfully', {
          count: validatedFiles.length,
          userId: req.user?.id,
          employeeId: req.params.id || req.body.employeeId,
          files: validatedFiles.map((f) => ({
            originalName: f.originalName,
            size: f.fileSize,
            type: f.mimeType
          }))
        })

        next()
      })
      .catch((error) => {
        // Log validation failure and return error response
        logger.error('Employee file validation failed:', error)
        return res.status(400).json({
          success: false,
          message: error.message
        })
      })
  } catch (error) {
    logger.error('Employee upload validation error:', error)
    return res.status(500).json({
      success: false,
      message: 'File upload validation error'
    })
  }
}

/**
 * Cleanup middleware to remove orphaned files on error
 * 
 * @function cleanupOnError
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description Middleware that automatically cleans up uploaded files when
 * errors occur during request processing. Prevents orphaned files from
 * accumulating on the server and maintains disk space.
 * 
 * @example
 * // Use as middleware before file upload routes
 * app.post('/upload', cleanupOnError, upload.array('files'), (req, res) => {
 *   // Handle file upload
 * });
 */
const cleanupOnError = (req, res, next) => {
  // Store original next function for proper error handling
  const originalNext = next

  // Override next to handle cleanup on errors
  req.next = function (err) {
    if (err && req.files) {
      // Clean up uploaded files on error to prevent orphaned files
      req.files.forEach((file) => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path)
            logger.info('Cleaned up orphaned employee file:', file.path)
          }
        } catch (cleanupError) {
          logger.error('Error cleaning up employee file:', cleanupError)
        }
      })
    }
    originalNext(err)
  }

  next()
}

/**
 * Get upload statistics and health information
 * 
 * @function getUploadStats
 * @returns {Object} Upload configuration and statistics
 * 
 * @description Returns comprehensive statistics about the upload configuration
 * including directory information, security features, limits, and health status.
 * Useful for monitoring and debugging upload functionality.
 * 
 * @example
 * // Get upload statistics
 * const stats = getUploadStats();
 * console.log('Upload directory exists:', stats.directoryExists);
 * console.log('Security features:', stats.securityFeatures);
 */
const getUploadStats = () => {
  try {
    const stats = {
      uploadDirectory: uploadDir,
      directoryExists: fs.existsSync(uploadDir),
      allowedExtensions: allowedExtensions.source,
      allowedMimeTypes,
      maxFileSize: '10 MB',
      maxFiles: 10,
      securityFeatures: {
        dangerousExtensionsBlocked: true,
        dangerousMimeTypesBlocked: true,
        fileSignatureValidation: true,
        suspiciousFilenameDetection: true,
        pathTraversalProtection: true
      }
    }

    // Get directory statistics if upload directory exists
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir, { withFileTypes: true })
      stats.directoryStats = {
        totalFiles: files.length,
        totalSize: 0 // Could be calculated if needed for monitoring
      }
    }

    return stats
  } catch (error) {
    logger.error('Error getting upload stats:', error)
    return {
      error: error.message,
      uploadDirectory: uploadDir
    }
  }
}

// Export all multer configuration components for use in routes
export { upload, validateUploadedFiles, cleanupOnError, getUploadStats }
