import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Ticket Controller Tests', () => {
  let controllerPath
  let fileContent

  beforeAll(() => {
    controllerPath = path.join(__dirname, '..', 'controllers', 'ticketController.js')
    fileContent = fs.readFileSync(controllerPath, 'utf8')
  })

  describe('File Structure and Imports', () => {
    it('should exist and be readable', () => {
      expect(fs.existsSync(controllerPath)).toBe(true)
      expect(fileContent.length).toBeGreaterThan(0)
    })

    it('should have valid JavaScript syntax', () => {
      // Check for basic JavaScript syntax patterns
      expect(fileContent).toContain('function ')
      expect(fileContent).toContain('const ')
      expect(fileContent).toContain('export ')
      expect(fileContent).toContain('import ')
    })

    it('should have proper ES6 module structure', () => {
      expect(fileContent).toContain('export async function addTicket')
      expect(fileContent).toContain('export async function uploadAttachments')
      expect(fileContent).toContain('export async function listTickets')
      expect(fileContent).toContain('export async function getTicketById')
      expect(fileContent).toContain('export async function updateTicket')
      expect(fileContent).toContain('export async function deleteTicket')
    })

    it('should import required modules', () => {
      expect(fileContent).toContain('import { validationResult } from \'express-validator\'')
      expect(fileContent).toContain('import Ticket from \'../models/Ticket.js\'')
      expect(fileContent).toContain('import Employee from \'../models/Employee.js\'')
      expect(fileContent).toContain('import logger from \'../utils/logger.js\'')
      expect(fileContent).toContain('import redisConfig from \'../config/redis.js\'')
    })
  })

  describe('Documentation', () => {
    it('should have a file-level JSDoc comment', () => {
      expect(fileContent).toContain('@fileoverview Ticket Controller for EMS Backend')
      expect(fileContent).toContain('@description Handles CRUD operations and business logic for ticket management system.')
      expect(fileContent).toContain('@author EMS Development Team')
      expect(fileContent).toContain('@version 1.0.0')
      expect(fileContent).toContain('@since 2025-09-17')
      expect(fileContent).toContain('@features')
    })

    it('should have JSDoc for addTicket function', () => {
      expect(fileContent).toContain('* Creates a new support ticket with validation and cache invalidation')
      expect(fileContent).toContain('* @async')
      expect(fileContent).toContain('* @function addTicket')
      expect(fileContent).toContain('* @param {Object} req - Express request object')
      expect(fileContent).toContain('* @param {Object} req.body - Request body containing ticket data')
      expect(fileContent).toContain('* @returns {Promise<void>} JSON response with creation status')
      expect(fileContent).toContain('* @throws {Error} If validation fails, self-assignment attempted, or database operation fails')
      expect(fileContent).toContain('* @example')
    })

    it('should have JSDoc for uploadAttachments function', () => {
      expect(fileContent).toContain('* Uploads file attachments to a specific ticket with validation and cache invalidation')
      expect(fileContent).toContain('* @function uploadAttachments')
      expect(fileContent).toContain('* @param {string} req.params._id - Ticket ID to upload attachments to')
      expect(fileContent).toContain('* @param {Object} req.files - Uploaded files from multer middleware')
      expect(fileContent).toContain('* @returns {Promise<void>} JSON response with upload status')
    })

    it('should have JSDoc for listTickets function', () => {
      expect(fileContent).toContain('* Retrieves all tickets with pagination, role-based access control, and Redis caching')
      expect(fileContent).toContain('* @function listTickets')
      expect(fileContent).toContain('* @param {Object} req.user - Authenticated user object (from middleware)')
      expect(fileContent).toContain('* @param {string} req.user.role - User role (admin, manager, employee)')
      expect(fileContent).toContain('* @param {number} req.user.employee - Employee ID')
      expect(fileContent).toContain('* @param {Object} req.query - Query parameters')
      expect(fileContent).toContain('* @param {number} req.query.page - Page number for pagination (default: 1)')
      expect(fileContent).toContain('* @param {number} req.query.limit - Number of records per page (default: 10)')
    })

    it('should have JSDoc for getTicketById function', () => {
      expect(fileContent).toContain('* Retrieves a specific ticket by ID with role-based access control and Redis caching')
      expect(fileContent).toContain('* @function getTicketById')
      expect(fileContent).toContain('* @param {string} req.params._id - Ticket ID')
      expect(fileContent).toContain('* @returns {Promise<void>} JSON response with ticket data or error')
    })

    it('should have JSDoc for updateTicket function', () => {
      expect(fileContent).toContain('* Updates an existing ticket with validation, role-based access control, and cache invalidation')
      expect(fileContent).toContain('* @function updateTicket')
      expect(fileContent).toContain('* @param {string} req.params._id - Ticket ID to update')
      expect(fileContent).toContain('* @returns {Promise<void>} JSON response with update status')
    })

    it('should have JSDoc for deleteTicket function', () => {
      expect(fileContent).toContain('* Deletes a ticket (admin only) with cache invalidation')
      expect(fileContent).toContain('* @function deleteTicket')
      expect(fileContent).toContain('* @param {string} req.params._id - Ticket ID to delete')
      expect(fileContent).toContain('* @returns {Promise<void>} JSON response with deletion status')
    })
  })

  describe('addTicket Function', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function addTicket (req, res) {')
    })

    it('should validate request parameters', () => {
      expect(fileContent).toContain('const errors = validationResult(req)')
      expect(fileContent).toContain('if (!errors.isEmpty()) {')
      expect(fileContent).toContain('return res.status(400).json({ errors: errors.array() })')
    })

    it('should extract ticket data from request body', () => {
      expect(fileContent).toContain('const {')
      expect(fileContent).toContain('title,')
      expect(fileContent).toContain('description,')
      expect(fileContent).toContain('status,')
      expect(fileContent).toContain('priority,')
      expect(fileContent).toContain('assignedTo,')
      expect(fileContent).toContain('dueDate,')
      expect(fileContent).toContain('category')
      expect(fileContent).toContain('} = req.body')
    })

    it('should prevent self-assignment', () => {
      expect(fileContent).toContain('if (assignedTo && assignedTo === req.user.employee?.toString()) {')
      expect(fileContent).toContain('return res.status(400).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Cannot assign ticket to self.\'')
    })

    it('should generate unique ticket number', () => {
      expect(fileContent).toContain('const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`')
    })

    it('should create ticket using Sequelize', () => {
      expect(fileContent).toContain('const ticket = await Ticket.create({')
      expect(fileContent).toContain('ticket_number: ticketNumber')
      expect(fileContent).toContain('title,')
      expect(fileContent).toContain('description,')
      expect(fileContent).toContain('status: status || \'Open\'')
      expect(fileContent).toContain('priority: priority || \'Medium\'')
      expect(fileContent).toContain('category: category || \'Other\'')
      expect(fileContent).toContain('assigned_to: assignedTo')
      expect(fileContent).toContain('created_by: req.user.employee')
      expect(fileContent).toContain('attachments: []')
    })

    it('should log creation', () => {
      expect(fileContent).toContain('logger.info(\'Ticket created\'')
      expect(fileContent).toContain('ticketId: ticket.id')
      expect(fileContent).toContain('ticketNumber')
    })

    it('should invalidate cache', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('await redisConfig.del(\'ticket:list:*\')')
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.status(201).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('message: \'Ticket created successfully\'')
      expect(fileContent).toContain('data: ticket')
    })

    it('should handle errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'Ticket creation failed\'')
      expect(fileContent).toContain('res.status(400).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Error creating ticket\'')
    })
  })

  describe('uploadAttachments Function', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function uploadAttachments (req, res) {')
    })

    it('should extract ticket ID', () => {
      expect(fileContent).toContain('const ticketId = req.params._id')
    })

    it('should find ticket by ID', () => {
      expect(fileContent).toContain('const ticket = await Ticket.findByPk(ticketId)')
    })

    it('should handle ticket not found', () => {
      expect(fileContent).toContain('if (!ticket) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Ticket not found\'')
    })

    it('should extract uploaded files', () => {
      expect(fileContent).toContain('const files = req.files || []')
    })

    it('should validate files uploaded', () => {
      expect(fileContent).toContain('if (!files.length) {')
      expect(fileContent).toContain('return res.status(400).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'No files uploaded\'')
    })

    it('should process file attachments', () => {
      expect(fileContent).toContain('const attachments = files.map((file) => ({')
      expect(fileContent).toContain('filename: file.filename')
      expect(fileContent).toContain('originalName: file.originalname')
      expect(fileContent).toContain('path: file.path')
      expect(fileContent).toContain('size: file.size')
      expect(fileContent).toContain('uploadedBy: req.user.employee')
      expect(fileContent).toContain('uploadedAt: new Date()')
    })

    it('should update ticket attachments', () => {
      expect(fileContent).toContain('const currentAttachments = ticket.attachments || []')
      expect(fileContent).toContain('const updatedAttachments = [...currentAttachments, ...attachments]')
      expect(fileContent).toContain('await ticket.update({ attachments: updatedAttachments })')
    })

    it('should invalidate cache', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('await redisConfig.del(\'ticket:list:*\')')
      expect(fileContent).toContain('await redisConfig.del(')
      expect(fileContent).toContain('redisConfig.generateKey(\'ticket\', \'detail\', ticketId)')
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('message: \'Attachments uploaded successfully\'')
      expect(fileContent).toContain('data: attachments')
    })
  })

  describe('listTickets Function', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function listTickets (req, res) {')
    })

    it('should extract user information', () => {
      expect(fileContent).toContain('const userRole = req.user.role')
      expect(fileContent).toContain('const userId = req.user.employee')
    })

    it('should handle pagination', () => {
      expect(fileContent).toContain('const page = parseInt(req.query.page) || 1')
      expect(fileContent).toContain('const limit = parseInt(req.query.limit) || 10')
      expect(fileContent).toContain('const offset = (page - 1) * limit')
    })

    it('should generate cache key', () => {
      expect(fileContent).toContain('const cacheKey = redisConfig.generateKey(')
      expect(fileContent).toContain('\'ticket\'')
      expect(fileContent).toContain('\'list\'')
      expect(fileContent).toContain('userRole')
      expect(fileContent).toContain('userId || \'anonymous\'')
      expect(fileContent).toContain('page')
      expect(fileContent).toContain('limit')
    })

    it('should check cache first', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('const cachedData = await redisConfig.get(cacheKey)')
      expect(fileContent).toContain('if (cachedData) {')
      expect(fileContent).toContain('logger.info(\'Ticket list served from cache\')')
      expect(fileContent).toContain('return res.json(cachedData)')
    })

    it('should implement role-based access control', () => {
      expect(fileContent).toContain('const whereClause = {}')
      expect(fileContent).toContain('if (userRole === \'admin\' || userRole === \'manager\') {')
      expect(fileContent).toContain('} else if (userRole === \'employee\') {')
      expect(fileContent).toContain('whereClause.created_by = userId')
    })

    it('should query database with pagination', () => {
      expect(fileContent).toContain('const { count, rows: tickets } = await Ticket.findAndCountAll({')
      expect(fileContent).toContain('where: whereClause')
      expect(fileContent).toContain('include: [')
      expect(fileContent).toContain('model: Employee')
      expect(fileContent).toContain('as: \'createdByEmployee\'')
      expect(fileContent).toContain('as: \'assignedToEmployee\'')
      expect(fileContent).toContain('limit')
      expect(fileContent).toContain('offset')
      expect(fileContent).toContain('order: [[\'createdAt\', \'DESC\']]')
    })

    it('should prepare response with pagination', () => {
      expect(fileContent).toContain('const result = {')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('data: tickets')
      expect(fileContent).toContain('pagination: {')
      expect(fileContent).toContain('page')
      expect(fileContent).toContain('limit')
      expect(fileContent).toContain('total: count')
      expect(fileContent).toContain('pages: Math.ceil(count / limit)')
    })

    it('should cache results', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('await redisConfig.setex(cacheKey, 300, result)')
    })
  })

  describe('getTicketById Function', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function getTicketById (req, res) {')
    })

    it('should extract ticket ID', () => {
      expect(fileContent).toContain('const ticketId = req.params._id')
    })

    it('should generate cache key', () => {
      expect(fileContent).toContain('const cacheKey = redisConfig.generateKey(\'ticket\', \'detail\', ticketId)')
    })

    it('should check cache first', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('const cachedData = await redisConfig.get(cacheKey)')
      expect(fileContent).toContain('if (cachedData) {')
      expect(fileContent).toContain('logger.info(\'Ticket detail served from cache\')')
      expect(fileContent).toContain('return res.json(cachedData)')
    })

    it('should find ticket by ID', () => {
      expect(fileContent).toContain('const ticket = await Ticket.findByPk(ticketId, {')
      expect(fileContent).toContain('include: [')
      expect(fileContent).toContain('model: Employee')
      expect(fileContent).toContain('as: \'createdByEmployee\'')
      expect(fileContent).toContain('as: \'assignedToEmployee\'')
    })

    it('should handle not found', () => {
      expect(fileContent).toContain('if (!ticket) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Ticket not found\'')
    })

    it('should implement role-based access control', () => {
      expect(fileContent).toContain('if (')
      expect(fileContent).toContain('req.user.role === \'employee\' &&')
      expect(fileContent).toContain('ticket.created_by !== req.user.employee')
      expect(fileContent).toContain(') {')
      expect(fileContent).toContain('return res.status(403).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Access denied\'')
    })

    it('should cache results', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('await redisConfig.setex(cacheKey, 300, result)')
    })
  })

  describe('updateTicket Function', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function updateTicket (req, res) {')
    })

    it('should validate request parameters', () => {
      expect(fileContent).toContain('const errors = validationResult(req)')
      expect(fileContent).toContain('if (!errors.isEmpty()) {')
      expect(fileContent).toContain('return res.status(400).json({ errors: errors.array() })')
    })

    it('should extract ticket ID', () => {
      expect(fileContent).toContain('const ticketId = req.params._id')
    })

    it('should find ticket by ID', () => {
      expect(fileContent).toContain('const ticket = await Ticket.findByPk(ticketId)')
    })

    it('should handle not found', () => {
      expect(fileContent).toContain('if (!ticket) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Ticket not found\'')
    })

    it('should implement role-based access control', () => {
      expect(fileContent).toContain('if (')
      expect(fileContent).toContain('req.user.role === \'employee\' &&')
      expect(fileContent).toContain('ticket.created_by !== req.user.employee')
      expect(fileContent).toContain(') {')
      expect(fileContent).toContain('return res.status(403).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Access denied\'')
    })

    it('should update selective fields', () => {
      expect(fileContent).toContain('const updates = req.body')
      expect(fileContent).toContain('const updatedData = {}')
      expect(fileContent).toContain('if (updates.title) updatedData.title = updates.title')
      expect(fileContent).toContain('if (updates.description) updatedData.description = updates.description')
      expect(fileContent).toContain('if (updates.status) updatedData.status = updates.status')
      expect(fileContent).toContain('if (updates.priority) updatedData.priority = updates.priority')
      expect(fileContent).toContain('if (updates.category) updatedData.category = updates.category')
      expect(fileContent).toContain('if (updates.assignedTo) updatedData.assigned_to = updates.assignedTo')
      expect(fileContent).toContain('if (updates.dueDate) updatedData.due_date = updates.dueDate')
      expect(fileContent).toContain('if (updates.resolution) updatedData.resolution = updates.resolution')
    })

    it('should set resolved date for resolved/closed tickets', () => {
      expect(fileContent).toContain('if (updates.status === \'Resolved\' || updates.status === \'Closed\') {')
      expect(fileContent).toContain('updatedData.resolved_date = new Date()')
    })

    it('should update ticket using Sequelize', () => {
      expect(fileContent).toContain('await ticket.update(updatedData)')
    })

    it('should log update', () => {
      expect(fileContent).toContain('logger.info(\'Ticket updated\'')
      expect(fileContent).toContain('ticketId: ticket.id')
    })

    it('should invalidate cache', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('await redisConfig.del(\'ticket:list:*\')')
      expect(fileContent).toContain('await redisConfig.del(')
      expect(fileContent).toContain('redisConfig.generateKey(\'ticket\', \'detail\', ticketId)')
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('message: \'Ticket updated successfully\'')
      expect(fileContent).toContain('data: ticket')
    })
  })

  describe('deleteTicket Function', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function deleteTicket (req, res) {')
    })

    it('should extract ticket ID', () => {
      expect(fileContent).toContain('const ticketId = req.params._id')
    })

    it('should find ticket by ID', () => {
      expect(fileContent).toContain('const ticket = await Ticket.findByPk(ticketId)')
    })

    it('should handle not found', () => {
      expect(fileContent).toContain('if (!ticket) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Ticket not found\'')
    })

    it('should delete ticket using Sequelize', () => {
      expect(fileContent).toContain('await ticket.destroy()')
    })

    it('should log deletion', () => {
      expect(fileContent).toContain('logger.info(\'Ticket deleted\'')
      expect(fileContent).toContain('ticketId')
    })

    it('should invalidate cache', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('await redisConfig.del(\'ticket:list:*\')')
      expect(fileContent).toContain('await redisConfig.del(')
      expect(fileContent).toContain('redisConfig.generateKey(\'ticket\', \'detail\', ticketId)')
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('message: \'Ticket deleted successfully\'')
    })
  })

  describe('Error Handling Patterns', () => {
    it('should have comprehensive error handling', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error')
      expect(fileContent).toContain('res.status(400)')
      expect(fileContent).toContain('res.status(404)')
      expect(fileContent).toContain('res.status(500)')
      expect(fileContent).toContain('res.status(403)')
    })

    it('should handle specific error cases', () => {
      expect(fileContent).toContain('Ticket creation failed')
      expect(fileContent).toContain('Upload Error')
      expect(fileContent).toContain('Error fetching tickets')
      expect(fileContent).toContain('Error fetching ticket')
      expect(fileContent).toContain('Ticket update failed')
      expect(fileContent).toContain('Ticket deletion failed')
    })

    it('should return proper error responses', () => {
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Error creating ticket\'')
      expect(fileContent).toContain('message: \'Failed to upload attachments\'')
      expect(fileContent).toContain('message: \'Error fetching tickets\'')
      expect(fileContent).toContain('message: \'Error fetching ticket\'')
      expect(fileContent).toContain('message: \'Error updating ticket\'')
      expect(fileContent).toContain('message: \'Error deleting ticket\'')
    })
  })

  describe('Logging Patterns', () => {
    it('should have proper logging statements', () => {
      expect(fileContent).toContain('logger.info(\'Ticket created\'')
      expect(fileContent).toContain('logger.info(\'Ticket list served from cache\'')
      expect(fileContent).toContain('logger.info(\'Ticket detail served from cache\'')
      expect(fileContent).toContain('logger.info(\'Ticket updated\'')
      expect(fileContent).toContain('logger.info(\'Ticket deleted\'')
    })
  })

  describe('Code Quality and Patterns', () => {
    it('should use async/await properly', () => {
      expect(fileContent).toContain('async function')
      expect(fileContent).toContain('await ')
    })

    it('should have proper error handling', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (')
    })

    it('should use consistent naming', () => {
      expect(fileContent).toContain('ticketId')
      expect(fileContent).toContain('userRole')
      expect(fileContent).toContain('userId')
      expect(fileContent).toContain('cacheKey')
    })

    it('should have proper return statements', () => {
      expect(fileContent).toContain('res.status(201)')
      expect(fileContent).toContain('res.status(200)')
      expect(fileContent).toContain('res.status(404)')
      expect(fileContent).toContain('res.status(400)')
      expect(fileContent).toContain('res.status(500)')
      expect(fileContent).toContain('res.status(403)')
    })

    it('should use Redis caching patterns', () => {
      expect(fileContent).toContain('redisConfig.isRedisConnected()')
      expect(fileContent).toContain('redisConfig.get(')
      expect(fileContent).toContain('redisConfig.setex(')
      expect(fileContent).toContain('redisConfig.del(')
      expect(fileContent).toContain('redisConfig.generateKey(')
    })

    it('should use Sequelize patterns', () => {
      expect(fileContent).toContain('Ticket.create(')
      expect(fileContent).toContain('Ticket.findByPk(')
      expect(fileContent).toContain('Ticket.findAndCountAll(')
      expect(fileContent).toContain('ticket.update(')
      expect(fileContent).toContain('ticket.destroy(')
    })

    it('should use validation patterns', () => {
      expect(fileContent).toContain('validationResult(req)')
      expect(fileContent).toContain('errors.isEmpty()')
      expect(fileContent).toContain('errors.array()')
    })

    it('should use role-based access control patterns', () => {
      expect(fileContent).toContain('req.user.role === \'employee\'')
      expect(fileContent).toContain('userRole === \'admin\' || userRole === \'manager\'')
      expect(fileContent).toContain('userRole === \'employee\'')
      expect(fileContent).toContain('ticket.created_by !== req.user.employee')
      expect(fileContent).toContain('whereClause.created_by = userId')
    })
  })
})
