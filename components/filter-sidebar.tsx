'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface FilterSidebarProps {
  categories: string[];
  materials?: string[];
  colors?: string[];
  styles?: string[];
  availabilityOptions?: string[];
  onFilterChange: (filters: FilterState) => void;
  priceRange?: [number, number];
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  materials: string[];
  colors: string[];
  styles: string[];
  availability: string[];
}

export function FilterSidebar({
  categories,
  materials = ['Wood', 'Metal', 'Fabric', 'Leather', 'Glass'],
  colors = ['Beige', 'Grey', 'Blue', 'Green', 'Brown', 'Black', 'White'],
  styles = ['Modern', 'Contemporary', 'Mid-Century', 'Industrial', 'Scandinavian'],
  availabilityOptions = ['In Stock', 'Made to Order'],
  onFilterChange,
  priceRange = [0, 500000],
}: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: priceRange,
    materials: [],
    colors: [],
    styles: [],
    availability: [],
  });

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['categories', 'price', 'materials', 'colors', 'styles'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (value: [number, number]) => {
    const newFilters = { ...filters, priceRange: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleMaterialChange = (material: string, checked: boolean) => {
    const newMaterials = checked
      ? [...filters.materials, material]
      : filters.materials.filter(m => m !== material);
    const newFilters = { ...filters, materials: newMaterials };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleColorChange = (color: string, checked: boolean) => {
    const newColors = checked
      ? [...filters.colors, color]
      : filters.colors.filter(c => c !== color);
    const newFilters = { ...filters, colors: newColors };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStyleChange = (style: string, checked: boolean) => {
    const newStyles = checked
      ? [...filters.styles, style]
      : filters.styles.filter(s => s !== style);
    const newFilters = { ...filters, styles: newStyles };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAvailabilityChange = (option: string, checked: boolean) => {
    const newAvailability = checked
      ? [...filters.availability, option]
      : filters.availability.filter(a => a !== option);
    const newFilters = { ...filters, availability: newAvailability };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      categories: [],
      priceRange: priceRange,
      materials: [],
      colors: [],
      styles: [],
      availability: [],
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const colorMap: Record<string, string> = {
    'Beige': '#F5F1E8',
    'Grey': '#757575',
    'Blue': '#1E40AF',
    'Green': '#2D5016',
    'Brown': '#8B4513',
    'Black': '#000000',
    'White': '#FFFFFF',
  };

  return (
    <aside className="w-full lg:w-[300px] border-r border-gray-200 pr-6">
      <div className="space-y-6">
        {/* Categories */}
        <div>
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full mb-3 font-semibold text-sm"
          >
            <span>CATEGORIES</span>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                expandedSections.has('categories') ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSections.has('categories') && (
            <div className="space-y-3">
              {categories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={checked =>
                      handleCategoryChange(category, checked as boolean)
                    }
                  />
                  <Label htmlFor={`cat-${category}`} className="cursor-pointer text-sm">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div>
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full mb-3 font-semibold text-sm"
          >
            <span>PRICE RANGE</span>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                expandedSections.has('price') ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSections.has('price') && (
            <div className="space-y-4">
              <Slider
                value={[filters.priceRange[0], filters.priceRange[1]]}
                onValueChange={value =>
                  handlePriceChange([value[0], value[1]])
                }
                min={priceRange[0]}
                max={priceRange[1]}
                step={5000}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span>₹{filters.priceRange[0].toLocaleString('en-IN')}</span>
                <span>₹{filters.priceRange[1].toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Materials */}
        <div>
          <button
            onClick={() => toggleSection('materials')}
            className="flex items-center justify-between w-full mb-3 font-semibold text-sm"
          >
            <span>MATERIALS</span>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                expandedSections.has('materials') ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSections.has('materials') && (
            <div className="space-y-3">
              {materials.map(material => (
                <div key={material} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mat-${material}`}
                    checked={filters.materials.includes(material)}
                    onCheckedChange={checked =>
                      handleMaterialChange(material, checked as boolean)
                    }
                  />
                  <Label htmlFor={`mat-${material}`} className="cursor-pointer text-sm">
                    {material}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colors */}
        <div>
          <button
            onClick={() => toggleSection('colors')}
            className="flex items-center justify-between w-full mb-3 font-semibold text-sm"
          >
            <span>COLORS</span>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                expandedSections.has('colors') ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSections.has('colors') && (
            <div className="flex flex-wrap gap-3">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    const isChecked = filters.colors.includes(color);
                    handleColorChange(color, !isChecked);
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    filters.colors.includes(color)
                      ? 'border-[#C47456] ring-2 ring-offset-2 ring-[#C47456]'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: colorMap[color] }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        {/* Styles */}
        <div>
          <button
            onClick={() => toggleSection('styles')}
            className="flex items-center justify-between w-full mb-3 font-semibold text-sm"
          >
            <span>STYLES</span>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                expandedSections.has('styles') ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSections.has('styles') && (
            <div className="space-y-3">
              {styles.map(style => (
                <div key={style} className="flex items-center space-x-2">
                  <Checkbox
                    id={`style-${style}`}
                    checked={filters.styles.includes(style)}
                    onCheckedChange={checked =>
                      handleStyleChange(style, checked as boolean)
                    }
                  />
                  <Label htmlFor={`style-${style}`} className="cursor-pointer text-sm">
                    {style}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Availability */}
        <div>
          <button
            onClick={() => toggleSection('availability')}
            className="flex items-center justify-between w-full mb-3 font-semibold text-sm"
          >
            <span>AVAILABILITY</span>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                expandedSections.has('availability') ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSections.has('availability') && (
            <div className="space-y-3">
              {availabilityOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`avail-${option}`}
                    checked={filters.availability.includes(option)}
                    onCheckedChange={checked =>
                      handleAvailabilityChange(option, checked as boolean)
                    }
                  />
                  <Label htmlFor={`avail-${option}`} className="cursor-pointer text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reset Button */}
        <Button
          onClick={handleReset}
          variant="outline"
          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Reset Filters
        </Button>
      </div>
    </aside>
  );
}