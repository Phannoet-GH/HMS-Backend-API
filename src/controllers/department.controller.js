import Department from '../models/department.model.js';
import Employee from '../models/employee.model.js';
import response from '../utils/response.js';

/**
 * Helper to safely sanitize incoming department bodies without dropping valid keys
 */
const sanitizeDepartmentBody = (body) => {
    const name = body.name ? String(body.name).trim() : '';
    const code = body.code ? String(body.code).trim().toUpperCase() : '';
    const budget = (body.budget !== undefined && body.budget !== null) ? Number(body.budget) : 0;
    const status = body.status || 'active';

    let managerId = body.managerId;
    if (managerId === "" || managerId === "null" || managerId === undefined) {
        managerId = null;
    }

    return {
        name,
        code,
        budget,
        managerId,
        status
    };
};

// 🔴 1. CREATE NEW DEPARTMENT
export const createDepartment = async (req, res, next) => {
    try {

        const sanitized = sanitizeDepartmentBody(req.body);

        const newDepartment = new Department(sanitized);
        const savedDept = await newDepartment.save();
        return res.status(201).json({
            success: true,
            message: "Department created successfully",
            data: savedDept
        });
    } catch (err) {
        next(err);
    }
};

// 🔴 2. UPDATE EXISTING DEPARTMENT
export const updateDepartment = async (req, res, next) => {
    try {
        const sanitized = sanitizeDepartmentBody(req.body);

        const updatedDept = await Department.findByIdAndUpdate(
            req.params.id,
            { $set: sanitized },
            { returnDocument: 'after', runValidators: true }
        ).populate({
            path: 'managerId',
            select: 'fullName position',
            options: { strictPopulate: false }
        });

        if (!updatedDept) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        return res.status(200).json({ success: true, message: "Department updated successfully", data: updatedDept });
    } catch (err) {
        next(err);
    }
};

// 🔴 3. GET ALL DEPARTMENTS (WITH DYNAMIC HEADCOUNT AGGREGATION)
export const getDepartments = async (req, res, next) => {
    try {
        // 🟢 Replaced basic find with an Aggregation Pipeline to dynamically compute staff count
        const list = await Department.aggregate([
            {
                // Step 1: Look into the employees collection to find workers matching this department ID
                $lookup: {
                    from: "employees",          // Must match actual MongoDB collection name (usually lowercase plural)
                    localField: "_id",          // Department primary key
                    foreignField: "departmentId", // Employee foreign key
                    as: "matchedEmployees"
                }
            },
            {
                // Step 2: Create the dynamic 'staffCount' property expected by the Angular table columns
                $addFields: {
                    staffCount: { $size: "$matchedEmployees" }
                }
            },
            {
                // Step 3: Drop the raw array of matched employee objects to optimize network payload size
                $project: {
                    matchedEmployees: 0
                }
            }
        ]);

        // Step 4: Run a Mongoose populate utility on our aggregated array to resolve manager details
        const populatedList = await Department.populate(list, {
            path: 'managerId',
            select: 'fullName position',
            options: { strictPopulate: false }
        });

        return res.status(200).json({
            success: true,
            message: "Success",
            data: populatedList
        });
    } catch (err) {
        next(err);
    }
};

// 🔴 4. GET SINGLE DEPARTMENT BY ID
export const getDepartmentById = async (req, res, next) => {
    try {
        const department = await Department.findById(req.params.id).populate({
            path: 'managerId',
            select: 'fullName position',
            options: { strictPopulate: false }
        });

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        return res.status(200).json({ success: true, message: "Success", data: department });
    } catch (err) {
        next(err);
    }
};

// 🔴 5. DELETE DEPARTMENT
export const deleteDepartment = async (req, res, next) => {
    try {
        const deletedDept = await Department.findByIdAndDelete(req.params.id);

        if (!deletedDept) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        return res.status(200).json({
            success: true,
            message: "Department deleted successfully",
            data: deletedDept
        });
    } catch (err) {
        next(err);
    }
};