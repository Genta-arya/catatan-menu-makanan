import React from 'react';
import { Clock, Users, Utensils, Sparkles, Image as ImageIcon, Play } from 'lucide-react';
import type { Recipe } from '../../types/recipe';
import { MealBadge } from './MealBadge';
import { parseMinutes } from '../../utils/recipeHelper';

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  const primaryImage =
    recipe.images && recipe.images.length > 0
      ? recipe.images[0]
      : 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80';

  const imageCount = recipe.images?.length || 0;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-sage-200 overflow-hidden shadow-sage-sm hover:shadow-sage-md hover:border-sage-300 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Thumbnail with overlay tags */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-sage-100">
        <img
          src={primaryImage}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Meal Type Badges on Top Left */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 z-10">
          {recipe.mealTypes.map((type) => (
            <MealBadge key={type} type={type} size="sm" />
          ))}
        </div>

        {/* Image Count Badge on Top Right */}
        {imageCount > 1 && (
          <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            <span>{imageCount} foto</span>
          </div>
        )}

        {/* Category Pill at bottom left */}
        <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-md text-sage-800 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm border border-sage-200">
          {recipe.category}
        </div>

        {/* Video Tutorial Pill at bottom right */}
        {recipe.videoUrl && (
          <div className="absolute bottom-2.5 right-2.5 bg-red-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
            <Play className="w-3 h-3 fill-white" />
            <span>Video</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sage-900 text-base sm:text-lg line-clamp-1 group-hover:text-sage-600 transition-colors">
            {recipe.title}
          </h3>
          {recipe.description && (
            <p className="text-sage-600 text-xs sm:text-sm line-clamp-2 mt-1">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Ingredients & Seasonings count tags */}
        <div className="mt-3 pt-3 border-t border-sage-100 flex items-center justify-between text-xs text-sage-600">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sage-700 font-medium">
              <Utensils className="w-3.5 h-3.5 text-sage-500" />
              <span>{recipe.ingredients.length} Bahan</span>
            </span>
            <span className="flex items-center gap-1 text-sage-700 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-sage-500" />
              <span>{recipe.seasonings.length} Bumbu</span>
            </span>
          </div>

          {(() => {
            const totalMins = parseMinutes(recipe.prepTime) + parseMinutes(recipe.cookTime);
            return totalMins > 0 ? (
              <span className="flex items-center gap-1 text-sage-500 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>{totalMins}m</span>
              </span>
            ) : null;
          })()}
        </div>
      </div>
    </div>
  );
};
