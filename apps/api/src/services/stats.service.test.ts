import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAverageGrades,
  getAverageGradesByClass,
  getTeacherNames,
  getStudentNames,
  getAllClasses,
  getClassStudents,
} from './stats.service';

vi.mock('../db', () => ({
  getDb: vi.fn(),
}));

vi.mock('./cache.service', () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(undefined),
}));

import { getDb } from '../db';
import { cacheGet, cacheSet } from './cache.service';

function mockQueryBuilder(result: unknown) {
  const builder = {
    selectFrom: vi.fn(),
    select: vi.fn(),
    innerJoin: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    executeTakeFirst: vi.fn().mockResolvedValue(result),
    execute: vi.fn().mockResolvedValue(result),
  };
  builder.selectFrom.mockReturnValue(builder);
  builder.select.mockReturnValue(builder);
  builder.innerJoin.mockReturnValue(builder);
  builder.where.mockReturnValue(builder);
  builder.orderBy.mockReturnValue(builder);
  return builder;
}

describe('stats.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cacheGet).mockResolvedValue(null);
  });

  it('getAverageGrades returns school-wide average', async () => {
    vi.mocked(getDb).mockReturnValue(mockQueryBuilder({ average: 88.5 }) as never);
    const result = await getAverageGrades();
    expect(result.averageGrade).toBe(88.5);
    expect(cacheSet).toHaveBeenCalled();
  });

  it('getAverageGradesByClass scopes by class', async () => {
    vi.mocked(getDb).mockReturnValue(mockQueryBuilder({ average: 91 }) as never);
    const result = await getAverageGradesByClass('class-id');
    expect(result.classId).toBe('class-id');
    expect(result.averageGrade).toBe(91);
  });

  it('getTeacherNames lists active teachers', async () => {
    vi.mocked(getDb).mockReturnValue(
      mockQueryBuilder([{ name: 'Alice' }, { name: 'Bob' }]) as never,
    );
    const result = await getTeacherNames();
    expect(result.teachers).toEqual(['Alice', 'Bob']);
  });

  it('getStudentNames lists active students', async () => {
    vi.mocked(getDb).mockReturnValue(mockQueryBuilder([{ name: 'Sam' }]) as never);
    const result = await getStudentNames();
    expect(result.students).toEqual(['Sam']);
  });

  it('getAllClasses returns class list', async () => {
    vi.mocked(getDb).mockReturnValue(
      mockQueryBuilder([{ id: '1', name: 'Math' }]) as never,
    );
    const result = await getAllClasses();
    expect(result.classes).toEqual([{ id: '1', name: 'Math' }]);
  });

  it('getClassStudents returns student names for class', async () => {
    vi.mocked(getDb).mockReturnValue(
      mockQueryBuilder([{ name: 'Sam' }, { name: 'Taylor' }]) as never,
    );
    const result = await getClassStudents('class-id');
    expect(result.classId).toBe('class-id');
    expect(result.students).toEqual(['Sam', 'Taylor']);
  });

  it('uses cache when available', async () => {
    vi.mocked(cacheGet).mockResolvedValue({ averageGrade: 77 });
    const result = await getAverageGrades();
    expect(result.averageGrade).toBe(77);
    expect(getDb).not.toHaveBeenCalled();
  });
});
