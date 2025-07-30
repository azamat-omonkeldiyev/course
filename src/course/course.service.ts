import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseQueryDto, PaginatedResult } from './dto/course-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService){}

  async create(createCourseDto: CreateCourseDto) {
    try {
      let newCourse = await this.prisma.course.create({data:createCourseDto})
      return newCourse
    } catch (error) {
      throw new InternalServerErrorException({ message: error.message });
    }
  }

  async findAll(options: CourseQueryDto = {}): Promise<PaginatedResult<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        teacher,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { teacher: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (teacher) {
        where.teacher = { contains: teacher, mode: 'insensitive' };
      }

      const total = await this.prisma.course.count({ where });

      const courses = await this.prisma.course.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          _count: {
            select: {
              users: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: courses,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new InternalServerErrorException({ message: error.message });
    }
  }

  async findOne(id: string) {
    try {
      const course = await this.prisma.course.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      if (!course) {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }

      return course;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({ message: error.message });
    }
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    try {
     await this.findOne(id)

      const updatedCourse = await this.prisma.course.update({
        where: { id },
        data: updateCourseDto
      });

      return updatedCourse;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({ message: error.message });
    }
  }

  async remove(id: string) {
    try {
     await this.findOne(id)

      const deletedCourse = await this.prisma.course.delete({
        where: { id }
      });

      return { message: 'Course deleted successfully', course: deletedCourse };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({ message: error.message });
    }
  }


  async enroll(courseId: string, userId: string) {
    try {
      const course = await this.findOne(courseId)

      if (!course) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const isEnrolled = course.users.some(enrolledUser => enrolledUser.id === userId);
      if (isEnrolled) {
        throw new InternalServerErrorException({ message: 'User is already enrolled in this course' });
      }

      const updatedCourse = await this.prisma.course.update({
        where: { id: courseId },
        data: {
          users: {
            connect: { id: userId }
          }
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      return {
        message: 'User enrolled successfully',
        course: updatedCourse
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException({ message: error.message });
    }
  }


}