import { serve } from '@hono/node-server'
import { Hono } from 'hono'
const app = new Hono()
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();



/*
async function main() {
  await prisma.professor.createMany({
    data: [
      { name: "Dr. Ravi Kumar", seniority: "SENIOR", aadharNumber: "123456789012" },
      { name: "Dr. Priya Sharma", seniority: "ASSOCIATE", aadharNumber: "987654321098" }
    ],
    skipDuplicates: true
  });

  // Fetch inserted professors to get their IDs
  const allProfessors = await prisma.professor.findMany();

  // Insert Students (Referencing Professors as Proctors)
  await prisma.student.createMany({
    data: [
      { name: "Amit Verma", dob: "2003-05-12", aadharNumber: "111122223333", proctorId: allProfessors[0].id },
      { name: "Neha Singh", dob: "2002-08-21", aadharNumber: "444455556666", proctorId: allProfessors[1].id }
    ],
    skipDuplicates: true
  });

  // Fetch inserted students to get their IDs
  const allStudents = await prisma.student.findMany();

  // Insert Library Memberships (Referencing Students)
  await prisma.libraryMembership.createMany({
    data: [
      { studentId: allStudents[0].id, issueDate: new Date("2024-01-10"), expiryDate: new Date("2025-01-10") },
      { studentId: allStudents[1].id, issueDate: new Date("2024-02-15"), expiryDate: new Date("2025-02-15") }
    ],
    skipDuplicates: true
  });

  console.log(" Data inserted successfully!");
}

// Execute main function
main()
  .catch((error) => {
    console.error(" Error inserting data:", error);
  })
  .finally(async () => {
    await
     prisma.$disconnect();
  });

  */


  //1. Fetch all students
  app.get('/students', async (c) => {
    try {
      const students = await prisma.student.findMany()
      return c.json(students)
    } catch (error) {
      return c.json({ error: 'Failed to fetch students' }, 500)
    }
  })

  //2. Fetch all students with their proctors
  app.get('/students/enriched', async (c) => {
    try {
      const students = await prisma.student.findMany({
        include: {
          proctor: true, 
        },
      });
  
      return c.json(students, 200);
    } catch (error) {
      return c.json({ error: 'Failed to fetch students' }, 500);
    }
  });



  //3. Fetch all professors
  app.get("/professors", async (c) => {
    try {
      const professors = await prisma.professor.findMany();
      return c.json(professors);
    } catch (error) {
      return c.json({ error: "Failed to fetch professors" }, 500);
    }
  });


  //4. 
  app.post("/students", async (c) => {
    try {
      const { name, dob, aadharNumber, proctorId } = await c.req.json();
  
      // Check if a student with the same aadharNumber already exists
      const existingStudent = await prisma.student.findUnique({
        where: { aadharNumber },
      });
  
      if (existingStudent) {
        return c.json({ error: "Student with this Aadhar number already exists" }, 400);
      }
  
      // Create new student
      const student = await prisma.student.create({
        data: {
          name,
          dob,
          aadharNumber,
          proctorId, // Ensure this is a valid professor ID
        },
      });
  return c.json(student, 201);
    } catch (error) {
      console.error("Error creating student:", error);
      return c.json({ error: "Failed to create student" }, 500);
    }
  });





  serve(app, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  });