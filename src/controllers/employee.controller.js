import Employee from '../models/employee.model.js';
import response from '../utils/response.js';

// 🟢 Helper to resolve manager and department
const resolveRelationships = async (data) => {
    // Populate both managerId (to get their name) AND departmentId (to get the department object)
    return await Employee.populate(data, [
        { path: 'managerId', select: 'fullName' },
        { path: 'departmentId', select: 'name code' } // 👈 This fixes your blank department issue
    ]);
};

export const getEmployees = async (req, res, next) => {
    try {
        const { status, departmentId, shift, role } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (departmentId) filter.departmentId = departmentId;
        if (shift) filter.shift = shift;
        if (role) filter.role = role;

        const employees = await Employee.find(filter)
            .populate({
                path: 'managerId',
                select: 'fullName',
                strictPopulate: false // 👈 Add this to stop the crash
            })
            .populate({
                path: 'departmentId',
                select: 'name',
                strictPopulate: false // 👈 Add this to stop the crash
            })
            .sort({ fullName: 1 });

        const mapped = employees.map(e => ({
            ...e.toObject(),
            reportsTo: e.managerId ? `${e.managerId.fullName}` : 'None'
        }));

        response.ok(res, mapped);
    } catch (error) {
        next(error);
    }
};
export const getEmployeeById = async (req, res, next) => {
    try {

        const employee = await Employee.findById(req.params.id)
            .populate('managerId', 'fullName')
            .populate('departmentId', 'name code');

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        response.ok(res, employee);

    } catch (error) {
        next(error);
    }
};

export const createEmployee = async (req, res, next) => {
    try {
        const { fullName, departmentId, position, managerId, shift, phone, status } = req.body;

        if (!fullName?.trim() || !departmentId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Validate Manager
        let resolvedManagerId = null;
        if (managerId) {
            const manager = await Employee.findById(managerId);
            if (!manager) return res.status(400).json({ success: false, message: 'Manager not found' });
            resolvedManagerId = managerId;
        }

        const employee = await Employee.create({
            fullName: fullName.trim(),
            departmentId, // 🟢 Correctly using the Object Reference
            position,
            managerId: resolvedManagerId,
            shift,
            phone: phone?.trim() || '',
            status
        });

        const populated = await resolveRelationships(employee);
        response.created(res, populated, 'Employee created');
    } catch (error) {
        next(error);
    }
};

export const updateEmployee = async (req, res, next) => {
    try {
        const { fullName, departmentId, position, managerId, shift, phone, status } = req.body;

        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            { fullName, departmentId, position, managerId, shift, phone, status },
            { new: true, runValidators: true }
        );

        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

        const populated = await resolveRelationships(employee);
        response.ok(res, populated, 'Employee updated');
    } catch (error) {
        next(error);
    }
};

export const deleteEmployee = async (req, res, next) => {
    try {
        await Employee.updateMany({ managerId: req.params.id }, { $set: { managerId: null } });
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
        response.ok(res, null, 'Employee deleted');
    } catch (error) {
        next(error);
    }
};