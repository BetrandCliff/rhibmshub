import { loadEnvFile } from "node:process";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../lib/generated/prisma-node/client";
import { Role } from "../lib/generated/prisma-node/enums";
import bcrypt from "bcryptjs";
import ws from "ws";
loadEnvFile(".env");
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL must be set to seed the database.");
neonConfig.webSocketConstructor = ws;
const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
async function main() {
    // Open the WebSocket before Prisma's transactional upserts begin.
    await db.$queryRaw`SELECT 1`;
    const password = await bcrypt.hash("Admin@12345", 12);
    const faculty = await db.faculty.upsert({
        where: { name: "Faculty of Engineering" },
        update: {},
        create: { name: "Faculty of Engineering" },
    });
    const dept = await db.department.upsert({
        where: { code: "CEN" },
        update: {},
        create: {
            name: "Computer Engineering",
            code: "CEN",
            facultyId: faculty.id,
        },
    });
    const program = await db.program
        .create({
            data: { name: "BTech Computer Engineering", departmentId: dept.id },
        })
        .catch(async () =>
            db.program.findFirstOrThrow({ where: { departmentId: dept.id } }),
        );
    const level = await db.level.upsert({
        where: { name: "Level 400" },
        update: {},
        create: { name: "Level 400" },
    });
    const group = await db.academicGroup.upsert({
        where: {
            programId_levelId_name: {
                programId: program.id,
                levelId: level.id,
                name: "A",
            },
        },
        update: {},
        create: { programId: program.id, levelId: level.id, name: "A" },
    });
    const office = await db.office.upsert({
        where: { name: "Registrar Office" },
        update: {},
        create: { name: "Registrar Office" },
    });
    const adminUser = await db.user.upsert({
        where: { email: "admin@rhibmshub.local" },
        update: {},
        create: {
            name: "System Administrator",
            email: "admin@rhibmshub.local",
            passwordHash: password,
            role: Role.SUPER_ADMIN,
        },
    });
    const signupFaculty = await db.faculty.upsert({ where: { name: 'Institutional Departments' }, update: {}, create: { name: 'Institutional Departments' } });
    const signupDepartments = [
        ['Nursing', 'NUR'],
        ['Medical Laboratory', 'MLT'],
        ['Civil Engineering', 'CIV'],
        ['Electrical Power Systems', 'EPS'],
        ['Midwifery', 'MID'],
        ['Bakery and Food Processing', 'BFP'],
    ] as const;
    for (const [name, code] of signupDepartments) {
        await db.department.upsert({ where: { code }, update: {}, create: { name, code, facultyId: signupFaculty.id } });
    }
    const staffPositions = [
        'Lecturer',
        'HOD',
        'Dean',
        'Director of Academic Affairs',
        'Registrar',
        'Human Resources',
        'Director of Finance',
        'Accountant',
        'Expense Manager',
        'President',
        'President’s Assistant',
    ];
    for (const name of staffPositions) {
        await db.staffPositionOption.upsert({ where: { name }, update: {}, create: { name, createdById: adminUser.id } });
    }
    await db.user.upsert({
        where: { email: "lecturer@rhibmshub.local" },
        update: {},
        create: {
            name: "Demo Lecturer",
            email: "lecturer@rhibmshub.local",
            passwordHash: password,
            role: Role.LECTURER,
            departmentId: dept.id,
        },
    });
    await db.user.upsert({
        where: { email: "student@rhibmshub.local" },
        update: {},
        create: {
            name: "Demo Student",
            email: "student@rhibmshub.local",
            passwordHash: password,
            role: Role.STUDENT,
            departmentId: dept.id,
            groupId: group.id,
        },
    });
    await db.user.upsert({
        where: { email: "office@rhibmshub.local" },
        update: {},
        create: {
            name: "Registrar Staff",
            email: "office@rhibmshub.local",
            passwordHash: password,
            role: Role.OFFICE_STAFF,
            officeId: office.id,
        },
    });
    console.log("Seed complete");
    console.log("Admin: admin@rhibmshub.local / Admin@12345");
    console.log("Lecturer: lecturer@rhibmshub.local / Admin@12345");
    console.log("Student: student@rhibmshub.local / Admin@12345");
    console.log("Office: office@rhibmshub.local / Admin@12345");
}
main().finally(() => db.$disconnect());
