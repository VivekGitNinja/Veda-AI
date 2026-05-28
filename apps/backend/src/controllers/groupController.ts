import { Request, Response } from 'express';
import { Group } from '../models/Group';
import { Assignment } from '../models/Assignment';

export const listGroups = async (req: Request, res: Response) => {
  try {
    let groups = await Group.find();
    if (groups.length === 0) {
      // Seed default groups
      const defaultGroups = [
        {
          name: 'Grade 10 — Science A', code: 'SCI10A', subject: 'Science',
          grade: 'Grade 10', studentCount: 28, assignmentsCount: 6, avgScore: 78,
          color: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
          lastActive: '2 days ago',
          students: ['Aarav Mehta','Aditi Sharma','Rohan Gupta','Neha Verma','Ishaan Malhotra','Diya Patel','Kabir Singh','Ananya Sen','Arjun Nair','Meera Rao','Siddharth Joshi','Priya Kapoor','Rishabh Dev','Tanya Goel','Yash Wardhan','Kriti Saxena','Devansh Bose','Avani Jain','Varun Dhawan','Shruti Iyer','Pranav Reddy','Riya Mukherjee','Rahul Kulkarni','Sneha Paul','Aditya Deshmukh','Pooja Hegde','Rohan Das','Tanvi Bhat'],
        },
        {
          name: 'Grade 10 — Science B', code: 'SCI10B', subject: 'Science',
          grade: 'Grade 10', studentCount: 32, assignmentsCount: 5, avgScore: 71,
          color: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
          lastActive: '1 day ago',
          students: ['Amit Patel','Priya Singh','Karan Malhotra','Riya Sen','Sanjay Kumar','Juhi Sharma','Hrithik Roy','Kajol Dev','Abhishek Bose','Aishwarya Iyer','Ranbir Kap','Katrina Singh','Saif Khan','Kareena Patel','Aamir Das','Kiran Rao','Shah Mishra','Gauri Joshi','Salman Gupta','Deepika Sen','Ranveer Das','Virat Gupta','Anushka Rao','Rohit Verma','Ritika Jain','Hardik Patel','Natasa Roy','Jasprit Kumar','Sanjana Gane','Shikhar Dhawan','Aesha Mukh','Yuvraj Singh'],
        },
        {
          name: 'Grade 11 — Physics', code: 'PHY11', subject: 'Physics',
          grade: 'Grade 11', studentCount: 24, assignmentsCount: 8, avgScore: 83,
          color: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500', badge: 'bg-violet-100 text-violet-700' },
          lastActive: 'Today',
          students: ['Vikram Aditya','Ananya Rao','Siddharth Joshi','Meera Nair','Rohan Kulkarni','Aditi Deshpande','Ganesh Kumar','Sartaj Singh','Katekar Ramesh','Bunty Mishra','Zoya Ahmed','Kiran Nair','Malcolm Xavier','Isa Farouk','Kanta Devi','Jojo Philip','Trivedi Harsh','Bipin Rawat','Parulkar Ajay','Majid Khan','Kamble Suresh','Karan Mehta','Chamar Singh','Bhonsle Raj'],
        },
        {
          name: 'Grade 12 — Mathematics', code: 'MATH12', subject: 'Mathematics',
          grade: 'Grade 12', studentCount: 20, assignmentsCount: 4, avgScore: 69,
          color: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' },
          lastActive: '3 days ago',
          students: ['Aryan Shah','Pooja Mehta','Dev Anand','Simran Kaur','Rahul Dev','Tanya Singh','Yash Kapoor','Kriti Joshi','Devansh Kumar','Avani Patel','Varun Sharma','Shruti Verma','Pranav Gupta','Riya Sen','Sneha Roy','Aditya Nair','Aditi Rao','Rohan Jain','Tanvi Das','Meera Bhat'],
        },
        {
          name: 'Grade 9 — Biology', code: 'BIO9', subject: 'Biology',
          grade: 'Grade 9', studentCount: 30, assignmentsCount: 3, avgScore: 75,
          color: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700' },
          lastActive: 'Today',
          students: ['Asha Patel','Ravi Kumar','Sunita Singh','Manoj Sharma','Geeta Joshi','Rakesh Gupta','Kavita Nair','Suresh Rao','Lalita Verma','Vijay Mehta','Anita Das','Sanjay Roy','Priti Sen','Dinesh Kapoor','Savita Jain','Ramesh Bhat','Usha Iyer','Mohan Kumar','Sunita Patel','Arun Singh','Deepa Sharma','Nitin Gupta','Asha Nair','Sunil Rao','Meena Verma','Rajesh Mehta','Pooja Das','Kiran Roy','Amit Sen','Priya Jain'],
        },
        {
          name: 'Grade 11 — Chemistry', code: 'CHEM11', subject: 'Chemistry',
          grade: 'Grade 11', studentCount: 22, assignmentsCount: 5, avgScore: 80,
          color: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700' },
          lastActive: 'Yesterday',
          students: ['Aditi Sharma','Rohan Mehta','Priya Gupta','Arjun Verma','Meera Singh','Siddharth Nair','Ananya Rao','Kabir Joshi','Neha Patel','Ishaan Das','Diya Kapoor','Tanvi Kumar','Rishabh Sen','Kriti Roy','Yash Bhat','Devansh Iyer','Avani Khan','Varun Jain','Shruti Bose','Pranav Agarwal','Riya Chauhan','Sneha Dixit'],
        },
      ];
      await Group.insertMany(defaultGroups);
      groups = await Group.find();
    }

    const dynamicGroups = await Promise.all(
      groups.map(async (group) => {
        const customCount = await Assignment.countDocuments({ groupId: group._id.toString() });
        const gObj = group.toObject();
        return {
          ...gObj,
          assignmentsCount: gObj.assignmentsCount + customCount,
        };
      })
    );

    return res.status(200).json(dynamicGroups);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching groups list' });
  }
};
