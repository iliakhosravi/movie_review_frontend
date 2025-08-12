import type { Movie } from '../types/Movie'
import MovieCard from './MovieCard'

interface Props {
  movies: Movie[]
  view: 'grid' | 'list'
}

const MovieList = ({movies, view}: Props) => {
    return (
        <div 
          className={`
            transition-all duration-500 ease-in-out
            ${view === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 auto-rows-max'
              : 'flex flex-col gap-8'
            }
          `}
        >
            {movies.map((movie, index) => (
                <div 
                  key={movie.id}
                  className="transform transition-all duration-500 ease-in-out"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    opacity: 0,
                    animation: 'fadeIn 0.5s ease-out forwards'
                  }}
                >
                    <MovieCard movie={movie} view={view} />
                </div>
            ))}

            <style >{`
                @keyframes fadeIn {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    )
}

export default MovieList