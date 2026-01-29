"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Users, Calendar, TrendingUp, BookOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Instructor {
    id?: number;
    name: string;
    avatar?: string;
    role?: string;
}

interface Course {
    id: number;
    title: string;
    slug: string;
    description?: string;
    short_description?: string;
    thumbnail?: string;
    category?: string;
    instructor?: Instructor;
    instructors?: Instructor[];
    price?: string;
    is_free?: boolean;
    enrollment_count?: number;
    max_enrollments?: number;
    course_url?: string;
    product_key?: string;
}

interface Enrollment {
    id: number;
    title: string;
    slug: string;
    enrollment_date: string;
    status: string;
    progress_percentage: number;
    completed_at?: string | null;
    category?: string;
    course_url?: string;
}

interface CoursesResponse {
    success: boolean;
    count?: number;
    courses: Course[];
}

interface EnrollmentsResponse {
    success: boolean;
    email: string;
    enrollments: Enrollment[];
}

export default function CoursesPage() {
    const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
    const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingEnrollments, setLoadingEnrollments] = useState(true);
    const [coursesError, setCoursesError] = useState<string | null>(null);
    const [enrollmentsError, setEnrollmentsError] = useState<string | null>(null);

    useEffect(() => {
        fetchAvailableCourses();
        fetchEnrollments();
    }, []);

    const fetchAvailableCourses = async () => {
        const token = localStorage.getItem("accessToken");

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/lms/courses`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            if (response.ok) {
                const data: CoursesResponse = await response.json();
                setAvailableCourses(data.courses || []);
            } else {
                setCoursesError("Failed to load available courses");
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            setCoursesError("Unable to connect to course service");
        } finally {
            setLoadingCourses(false);
        }
    };

    const fetchEnrollments = async () => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            setLoadingEnrollments(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/lms/my-enrollments`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data: EnrollmentsResponse = await response.json();
                setEnrolledCourses(data.enrollments || []);
            } else {
                setEnrollmentsError("Failed to load your enrollments");
            }
        } catch (error) {
            console.error("Error fetching enrollments:", error);
            setEnrollmentsError("Unable to load your enrollments");
        } finally {
            setLoadingEnrollments(false);
        }
    };

    // Filter out enrolled courses from available courses
    const unenrolledCourses = availableCourses.filter(course => {
        // Check if this course ID matches any enrolled course ID
        return !enrolledCourses.some(enrollment => enrollment.id === course.id);
    });

    const CourseCardSkeleton = () => (
        <Card>
            <Skeleton className="h-48 w-full rounded-t-lg" />
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-1/2" />
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
                <p className="text-muted-foreground mt-2">
                    Browse available courses and track your learning progress
                </p>
            </div>

            {/* My Enrolled Courses Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-semibold">My Enrolled Courses</h2>
                </div>

                {loadingEnrollments ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <CourseCardSkeleton key={i} />
                        ))}
                    </div>
                ) : enrollmentsError ? (
                    <Card className="border-destructive">
                        <CardContent className="pt-6">
                            <p className="text-destructive">{enrollmentsError}</p>
                        </CardContent>
                    </Card>
                ) : enrolledCourses.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    You haven't enrolled in any courses yet. Browse available courses below!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {enrolledCourses.map((enrollment) => (
                            <Card key={enrollment.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg">{enrollment.title}</CardTitle>
                                        <Badge variant={enrollment.status === "enrolled" ? "default" : "secondary"}>
                                            {enrollment.status}
                                        </Badge>
                                    </div>
                                    {enrollment.category && (
                                        <CardDescription>{enrollment.category}</CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>Enrolled {new Date(enrollment.enrollment_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span className="font-medium">{enrollment.progress_percentage.toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-secondary rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{ width: `${enrollment.progress_percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    {enrollment.completed_at && (
                                        <Badge variant="outline" className="text-green-600 border-green-600">
                                            Completed
                                        </Badge>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    {enrollment.course_url && (
                                        <Button asChild className="w-full">
                                            <a href={enrollment.course_url} target="_blank" rel="noopener noreferrer">
                                                Continue Learning
                                                <ExternalLink className="ml-2 h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Separator />

            {/* Available Courses Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-semibold">Available Courses</h2>
                </div>

                {loadingCourses ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <CourseCardSkeleton key={i} />
                        ))}
                    </div>
                ) : coursesError ? (
                    <Card className="border-destructive">
                        <CardContent className="pt-6">
                            <p className="text-destructive">{coursesError}</p>
                        </CardContent>
                    </Card>
                ) : unenrolledCourses.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    {enrolledCourses.length > 0
                                        ? "You're enrolled in all available courses!"
                                        : "No courses available at the moment. Check back soon!"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {unenrolledCourses.map((course) => {
                            const instructor = course.instructor || course.instructors?.[0];
                            return (
                                <Card key={course.id} className="flex flex-col overflow-hidden">
                                    {course.thumbnail && (
                                        <div className="relative h-48 w-full overflow-hidden bg-muted">
                                            <img
                                                src={course.thumbnail}
                                                alt={course.title}
                                                className="h-full w-full object-cover transition-transform hover:scale-105"
                                            />
                                        </div>
                                    )}
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                                            {course.is_free ? (
                                                <Badge variant="secondary">Free</Badge>
                                            ) : course.price ? (
                                                <Badge variant="default">৳{course.price}</Badge>
                                            ) : null}
                                        </div>
                                        {course.category && (
                                            <CardDescription>{course.category}</CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent className="flex-1 space-y-3">
                                        {course.short_description && (
                                            <p className="text-sm text-muted-foreground line-clamp-3">
                                                {course.short_description}
                                            </p>
                                        )}
                                        {instructor && (
                                            <div className="flex items-center gap-2 text-sm">
                                                {instructor.avatar && (
                                                    <img
                                                        src={instructor.avatar}
                                                        alt={instructor.name}
                                                        className="h-6 w-6 rounded-full"
                                                    />
                                                )}
                                                <span className="text-muted-foreground">{instructor.name}</span>
                                            </div>
                                        )}

                                    </CardContent>
                                    <CardFooter>
                                        {course.slug && (
                                            <Button asChild variant="outline" className="w-full">
                                                <a href={`https://dsatschool.com/courses/${course.slug}`} target="_blank" rel="noopener noreferrer">
                                                    View Course
                                                    <ExternalLink className="ml-2 h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
