import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const employees = await prisma.employee.findMany({
      include: { branch: true },
      orderBy: { created_at: 'desc' }
    });
    // Remove passwords before returning
    const safeEmployees = employees.map(emp => {
      const { password, ...rest } = emp;
      return rest;
    });
    return NextResponse.json(safeEmployees);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Hash password if provided
    let password = data.password ? await bcrypt.hash(data.password, 10) : await bcrypt.hash('123456', 10);
    
    const existing = await prisma.employee.findUnique({
      where: { username: data.username }
    });

    if (existing) {
      return NextResponse.json({ message: 'Username is already taken' }, { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        username: data.username,
        password: password,
        name: data.name,
        position_name: data.position_name,
        role: data.role || 'STAFF',
        branch_id: data.branch_id
      }
    });

    const { password: _, ...safeEmployee } = employee;
    return NextResponse.json(safeEmployee);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
