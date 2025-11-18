'use client';

import { Suspense, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { DISHES, CATEGORIES } from '@/lib/data';
import { DishCard } from '@/components/menu/dish-card';
import { CategoryCarousel } from '@/components/menu/category-carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function MenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-1');
  const currentCategory = searchParams.get('category') || CATEGORIES[0].id;
  const table = searchParams.get('table');

  useEffect(() => {
    if (table) {
      localStorage.setItem('tableNumber', table);
    } else {
      const storedTable = localStorage.getItem('tableNumber');
      if (storedTable) {
        // Re-add table to URL if it's in storage but not in params
        router.replace(`/?table=${storedTable}&category=${currentCategory}#menu`);
      } else {
        // Redirect to scan if no table in params or storage
        router.replace('/scan');
      }
    }
  }, [table, router, currentCategory]);
  
  // Don't render anything until the effect has run and determined the correct path
  if (!table && typeof window !== 'undefined' && !localStorage.getItem('tableNumber')) {
    return null; // Or a loading spinner
  }

  const filteredDishes = DISHES.filter(
    (dish) => dish.categoryId === currentCategory
  );

  return (
    <div className="w-full">
      <section className="relative h-[40vh] md:h-[50vh] w-full">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-white tracking-tight leading-tight">
              A Symphony of Indian Flavors
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/90">
              Explore our curated menu and order directly from your table.
            </p>
          </div>
        </div>
      </section>

      <section id="menu" className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline text-center font-bold mb-10">
            Explore Our Menu
          </h2>
          <CategoryCarousel
            categories={CATEGORIES}
            currentCategory={currentCategory!}
          />
          {filteredDishes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mt-10">
              {filteredDishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} />
              ))}
            </div>
          ) : (
             <p className="text-center text-muted-foreground mt-10">No dishes found in this category.</p>
          )}
        </div>
      </section>
    </div>
  );
}


export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MenuContent />
    </Suspense>
  )
}
