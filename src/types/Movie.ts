export interface Movie {
    id:number;
    title: string;
    genre: string;
    year: number;
    director: string;
    rating: number;
    description: string;
    poster: string;
    videoUrl: string;
    releaseDate?: string;
    isPublic?: boolean; // Added for public/private video support
}