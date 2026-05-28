import { Request, Response } from 'express';
import { Profile } from '../models/Profile';

export const getProfile = async (req: Request, res: Response) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({
        schoolName: 'Delhi Public School',
        schoolBranch: 'Bokaro Steel City',
        teacherName: 'Lakshya K.',
        teacherEmail: 'lakshya@dpsbokaro.edu',
        academicSession: '2026-2027',
        affiliationBoard: 'CBSE',
        aiEngine: 'mock',
        pdfFormatting: true,
        defaultDuration: '1 Hour',
        defaultPassingMarks: 40,
        defaultInstructions: '1. All questions are compulsory.\n2. Please write your name and roll number clearly.',
      });
    }
    return res.status(200).json(profile);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile();
    }
    
    const fieldsToUpdate = req.body;
    Object.assign(profile, fieldsToUpdate);
    await profile.save();

    return res.status(200).json(profile);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error updating profile' });
  }
};
