'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUploader from "./image-uploader-componet"

export interface ColorVariant {
  color: string;
  colorCode?: string;
  images: string[];
}

interface ColorVariantManagerProps {
  variants: ColorVariant[];
  onVariantsChange: (variants: ColorVariant[]) => void;
}

const PRESET_COLORS = [
  { name: 'Red', code: '#DC2626' },
  { name: 'Blue', code: '#2563EB' },
  { name: 'Green', code: '#16A34A' },
  { name: 'Yellow', code: '#EAB308' },
  { name: 'Purple', code: '#9333EA' },
  { name: 'Pink', code: '#EC4899' },
  { name: 'Orange', code: '#EA580C' },
  { name: 'Brown', code: '#92400E' },
  { name: 'Black', code: '#000000' },
  { name: 'White', code: '#FFFFFF' },
  { name: 'Gray', code: '#6B7280' },
  { name: 'Beige', code: '#D4C5B9' },
];

export default function ColorVariantManager({
  variants,
  onVariantsChange,
}: ColorVariantManagerProps) {
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
  const [editColorName, setEditColorName] = useState('');

  const addVariant = () => {
    const newVariant: ColorVariant = {
      color: 'New Color',
      colorCode: '#000000',
      images: [],
    };
    onVariantsChange([...variants, newVariant]);
    setActiveVariantIndex(variants.length);
  };

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(newVariants);
    if (activeVariantIndex >= newVariants.length) {
      setActiveVariantIndex(Math.max(0, newVariants.length - 1));
    }
  };

  const updateVariantImages = (images: string[]) => {
    const newVariants = [...variants];
    newVariants[activeVariantIndex].images = images;
    onVariantsChange(newVariants);
  };

  const updateVariantColor = (index: number, color: string, colorCode?: string) => {
    const newVariants = [...variants];
    newVariants[index].color = color;
    if (colorCode) newVariants[index].colorCode = colorCode;
    onVariantsChange(newVariants);
    setEditingColorIndex(null);
  };

  const startEditingColor = (index: number) => {
    setEditingColorIndex(index);
    setEditColorName(variants[index].color);
  };

  const activeVariant = variants[activeVariantIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Color Variants</Label>
        <Button
          type="button"
          size="sm"
          onClick={addVariant}
          className="bg-[#2C2C2C]"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Color
        </Button>
      </div>

      {variants.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <p className="text-gray-500">No color variants yet. Click "Add Color" to start.</p>
        </div>
      ) : (
        <>
          {/* Color Tabs */}
          <div className="flex flex-wrap gap-2">
            {variants.map((variant, index) => (
              <div
                key={index}
                className={`relative group flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer ${
                  activeVariantIndex === index
                    ? 'border-[#C47456] bg-[#C47456]/5'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setActiveVariantIndex(index)}
              >
                {editingColorIndex === index ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editColorName}
                      onChange={(e) => setEditColorName(e.target.value)}
                      className="h-7 w-24"
                      autoFocus
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateVariantColor(index, editColorName, variant.colorCode);
                      }}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className="w-5 h-5 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: variant.colorCode || '#000' }}
                    />
                    <span className="text-sm font-medium">{variant.color}</span>
                    <span className="text-xs text-gray-500">
                      ({variant.images.length})
                    </span>
                  </>
                )}

                {editingColorIndex !== index && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingColor(index);
                      }}
                      className="text-gray-600 hover:text-[#C47456]"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeVariant(index);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Color Picker */}
          {activeVariant && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label>Pick a color for "{activeVariant.color}":</Label>
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="text-sm text-[#C47456] hover:underline"
                >
                  {showColorPicker ? 'Hide colors' : 'Show colors'}
                </button>
              </div>

              {showColorPicker && (
                <div className="grid grid-cols-6 gap-2 p-4 bg-gray-50 rounded-lg">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() =>
                        updateVariantColor(
                          activeVariantIndex,
                          activeVariant.color,
                          preset.code
                        )
                      }
                      className="group relative"
                    >
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-[#C47456] transition-all hover:scale-110"
                        style={{ backgroundColor: preset.code }}
                      />
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                  <div>
                    <input
                      type="color"
                      value={activeVariant.colorCode || '#000000'}
                      onChange={(e) =>
                        updateVariantColor(
                          activeVariantIndex,
                          activeVariant.color,
                          e.target.value
                        )
                      }
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                    <span className="text-xs text-gray-600 mt-1 block text-center">Custom</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Image Uploader for Active Variant */}
          {activeVariant && (
            <div className="border rounded-lg p-4 bg-white">
              <Label className="mb-3 block">
                Images for <span className="font-semibold">{activeVariant.color}</span>
              </Label>
              <ImageUploader
                images={activeVariant.images}
                onImagesChange={updateVariantImages}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}