import { describe, it, expect } from 'vitest';
import { matchSchoolLifeDialogue } from './chat.school-life';

describe('matchSchoolLifeDialogue', () => {
  it('explains the platform', () => {
    const reply = matchSchoolLifeDialogue('what is school portal', 'student');
    expect(reply).toBeTruthy();
    expect(reply!.toLowerCase()).toMatch(/portal|platform/);
  });

  it('describes school life on the platform', () => {
    const reply = matchSchoolLifeDialogue('tell me about school life', 'student');
    expect(reply).toBeTruthy();
    expect(reply!.toLowerCase()).toMatch(/class|assignment|portal/);
  });

  it('covers teachers in platform context', () => {
    const reply = matchSchoolLifeDialogue('what do teachers do', 'teacher');
    expect(reply).toBeTruthy();
    expect(reply!.toLowerCase()).toMatch(/class|assignment|grade/);
  });

  it('covers students in platform context', () => {
    const reply = matchSchoolLifeDialogue('about students', 'student');
    expect(reply).toBeTruthy();
    expect(reply!.toLowerCase()).toMatch(/student|assignment|class/);
  });

  it('identifies as platform assistant', () => {
    const reply = matchSchoolLifeDialogue('what is your job', 'student');
    expect(reply).toBeTruthy();
    expect(reply!.toLowerCase()).toMatch(/portal|platform|assistant/);
  });

  it('respects role-specific platform sections', () => {
    const adminReply = matchSchoolLifeDialogue('admin dashboard', 'admin');
    expect(adminReply).toBeTruthy();
    expect(adminReply!.toLowerCase()).toContain('admin');

    const studentReply = matchSchoolLifeDialogue('student dashboard', 'student');
    expect(studentReply).toBeTruthy();
    expect(studentReply!.toLowerCase()).toContain('student');
  });
});
