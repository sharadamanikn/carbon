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
        const student = await prisma.student.create({
        data: {
          name,
          dob,
          aadharNumber,
          proctorId, 
        },
      });
  return c.json(student, 201);
    } catch (error) {
      console.error("Error creating student:", error);
      return c.json({ error: "Failed to create student" }, 500);
    }
  });

//5. Create a new professor
  app.post('/professors', async (c) => {
    try {
      const { name, seniority, aadharNumber } = await c.req.json();
        const existingProfessor = await prisma.professor.findUnique({
        where: { aadharNumber },
      });
  
      if (existingProfessor) {
        return c.json({ error: "Professor with this Aadhar number already exists." }, 400);
      }
        const professor = await prisma.professor.create({
        data: {
          name,
          seniority,
          aadharNumber,
        },
      });
  
      return c.json({ message: "Professor created successfully", professor }, 201);
    } catch (error) {
      console.error("Error creating professor:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  });
  


  //6. Fetch proctorship details for a professor
  app.get('/professors/:professorId/proctorships', async (c) => {
    try {
      const professorId = c.req.param('professorId');
  
      const professor = await prisma.professor.findUnique({
        where: { id: professorId },
        include: { students: true }, 
        });
  
      if (!professor) {
        return c.json({ error: "Professor not found" }, 404);
      }
  
      return c.json({ 
        professor: {
          id: professor.id,
          name: professor.name,
          seniority: professor.seniority
        },
        students: professor.students
      });
    } catch (error) {
      console.error("Error fetching proctorship details:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  });
  

  //7. Update student details
  app.patch('/students/:studentId', async (c) => {
    try {
      const studentId = c.req.param('studentId');
      const data = await c.req.json(); 
      const existingStudent = await prisma.student.findUnique({
        where: { id: studentId },
      });
  
      if (!existingStudent) {
        return c.json({ error: "Student not found" }, 404);
      }
        const updatedStudent = await prisma.student.update({
        where: { id: studentId },
        data, 
      });
  
      return c.json({ message: "Student updated successfully", student: updatedStudent });
    } catch (error) {
      console.error("Error updating student:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  });
  

  //8.Update professor details
  app.patch('/professors/:professorId', async (c) => {
    try {
      const professorId = c.req.param('professorId');
      const data = await c.req.json(); 
        const existingProfessor = await prisma.professor.findUnique({
        where: { id: professorId },
      });
  
      if (!existingProfessor) {
        return c.json({ error: "Professor not found" }, 404);
      }
        const updatedProfessor = await prisma.professor.update({
        where: { id: professorId },
        data, 
      });
  
      return c.json({ message: "Professor updated successfully", professor: updatedProfessor });
    } catch (error) {
      console.error("Error updating professor:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  });

  

  // DELETE /students/:studentId - Deletes a student by their ID
app.delete('/students/:studentId', async (c) => {
  try {
    const studentId = c.req.param('studentId');
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      return c.json({ error: "Student not found" }, 404);
    }
    await prisma.student.delete({
      where: { id: studentId },
    });

    return c.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// DELETE /professors/:professorId - Deletes a professor by their ID
app.delete('/professors/:professorId', async (c) => {
  try {
    const professorId = c.req.param('professorId');
    const existingProfessor = await prisma.professor.findUnique({
      where: { id: professorId },
    });

    if (!existingProfessor) {
      return c.json({ error: "Professor not found" }, 404);
    }
    await prisma.professor.delete({
      where: { id: professorId },
    });

    return c.json({ message: "Professor deleted successfully" });
  } catch (error) {
    console.error("Error deleting professor:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});



//11.  Assigns a student under the proctorship of a professor
app.post('/professors/:professorId/proctorships', async (c) => {
  try {
    const professorId = c.req.param('professorId');
    const { studentId } = await c.req.json(); 
    const existingProfessor = await prisma.professor.findUnique({
      where: { id: professorId },
    });

    if (!existingProfessor) {
      return c.json({ error: "Professor not found" }, 404);
    }
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      return c.json({ error: "Student not found" }, 404);
    }
    await prisma.student.update({
      where: { id: studentId },
      data: { proctorId: professorId },
    });

    return c.json({ message: "Student assigned to professor successfully" });
  } catch (error) {
    console.error("Error assigning student to professor:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

//12. Get library membership details for a student
app.get('/students/:studentId/library-membership', async (c) => {
  try {
    const studentId = c.req.param('studentId');
    const studentWithMembership = await prisma.student.findUnique({
      where: { id: studentId },
      include: { libraryMembership: true },
    });

    if (!studentWithMembership) {
      return c.json({ error: 'Student not found' }, 404);
    }
    if (!studentWithMembership.libraryMembership) {
      return c.json({ error: 'Library membership not found for this student' }, 404);
    }

    return c.json(studentWithMembership.libraryMembership);
  } catch (error) {
    console.error('Error fetching library membership:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});



//13. Create a library membership for a student
app.post('/students/:studentId/library-membership', async (c) => {
  try {
    const studentId = c.req.param('studentId');
    const { issueDate, expiryDate } = await c.req.json();
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { libraryMembership: true },
    });

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }
    if (student.libraryMembership) {
      return c.json({ error: 'Library membership already exists for this student' }, 400);
    }
    const newMembership = await prisma.libraryMembership.create({
      data: {
        studentId,
        issueDate: new Date(issueDate),
        expiryDate: new Date(expiryDate),
      },
    });

    return c.json(newMembership, 201);
  } catch (error) {
    console.error('Error creating library membership:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});



//14. Update library membership details for a student
app.patch('/students/:studentId/library-membership', async (c) => {
  try {
    const studentId = c.req.param('studentId');
    const { issueDate, expiryDate } = await c.req.json();
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { libraryMembership: true },
    });

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }
    if (!student.libraryMembership) {
      return c.json({ error: 'Library membership not found for this student' }, 404);
    }
    const updatedMembership = await prisma.libraryMembership.update({
      where: { studentId },
      data: {
        issueDate: issueDate ? new Date(issueDate) : student.libraryMembership.issueDate,
        expiryDate: expiryDate ? new Date(expiryDate) : student.libraryMembership.expiryDate,
      },
    });

    return c.json(updatedMembership, 200);
  } catch (error) {
    console.error('Error updating library membership:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});


//15. Delete library membership for a student
app.delete("/students/:studentId/library-membership", async (c) => {
  try {
    const studentId = c.req.param("studentId");
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { libraryMembership: true },
    });
if (!student) {
      return c.json({ error: "Student not found" }, 404);
    }

    if (!student.libraryMembership) {
      return c.json({ error: "Library membership not found for this student" }, 404);
    }

    await prisma.libraryMembership.delete({
      where: { studentId },
    });

    return c.json({ message: "Library membership deleted successfully" }, 200);
  } catch (error) {
    console.error("Error deleting library membership:", error);
    return c.json({ error: "Failed to delete library membership" }, 500);
  }
});


  serve(app, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  });