'use client';

import React from 'react';
import { UserCheck, Shield, Key } from 'lucide-react';

export default function AdminStaffPage() {
  const staff = [
    {
      name: 'Vikramaditya Rao',
      email: 'admin@grovia.in',
      role: 'SUPER_ADMIN',
      permissions: 'All System Permissions, Financials, Inventory, Config',
      status: 'ACTIVE',
    },
    {
      name: 'Rajesh Nair',
      email: 'inventory@grovia.in',
      role: 'INVENTORY_MGR',
      permissions: 'Manage Stock, Adjust Inventory, Procurement, Suppliers',
      status: 'ACTIVE',
    },
    {
      name: 'Kavita Sundaram',
      email: 'orders@grovia.in',
      role: 'ORDER_MGR',
      permissions: 'Order Processing, Customer Dispatch, Cancellations',
      status: 'ACTIVE',
    },
    {
      name: 'Karthik Somanna',
      email: 'logistics@grovia.in',
      role: 'DELIVERY_MGR',
      permissions: 'Delivery Route Assignment, Partner Allocation, Tracking',
      status: 'ACTIVE',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
          Staff & Role-Based Access Control (RBAC)
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Manage administrator permissions, department managers, and audit policies
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase text-[10px] tracking-wider bg-gray-50/50 dark:bg-slate-800/40">
              <th className="py-3 px-4 font-bold">Staff Member</th>
              <th className="py-3 px-4 font-bold">Email</th>
              <th className="py-3 px-4 font-bold">Role</th>
              <th className="py-3 px-4 font-bold">Assigned Privileges</th>
              <th className="py-3 px-4 font-bold">Account Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {staff.map((s, idx) => (
              <tr key={idx} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                  {s.name}
                </td>
                <td className="py-3.5 px-4 font-mono text-gray-500">{s.email}</td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-green-50 text-[#2E7D32] border border-green-200">
                    {s.role}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 max-w-xs">{s.permissions}</td>
                <td className="py-3.5 px-4">
                  <span className="bg-green-100 text-[#2E7D32] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
