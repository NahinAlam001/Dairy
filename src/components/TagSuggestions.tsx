"use client";

import { useState } from "react";
import { suggestTags } from "@/ai/flows/intelligent-tagging";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TagSuggestionsProps {
  content: string;
  currentTags: string[];
  onTagsUpdate: (newTags: string[]) => void;
}

export function TagSuggestions({
  content,
  currentTags,
  onTagsUpdate,
}: TagSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggestTags = async () => {
    if (!content) {
      toast({
        title: "Cannot suggest tags",
        description: "Write something in your diary first!",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await suggestTags({ diaryContent: content });
      // Filter out tags that are already present
      const newSuggestions = result.tags.filter(
        (tag) => !currentTags.includes(tag),
      );
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Failed to suggest tags:", error);
      toast({
        title: "AI Error",
        description: "Could not generate tag suggestions at this time.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = (tagToAdd: string) => {
    if (!currentTags.includes(tagToAdd)) {
      onTagsUpdate([...currentTags, tagToAdd]);
      // Remove from suggestions list once added
      setSuggestions(suggestions.filter((s) => s !== tagToAdd));
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <Button
        onClick={handleSuggestTags}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="mr-2 h-4 w-4" />
        )}
        Suggest Tags
      </Button>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((tag) => (
          <Badge
            key={tag}
            variant="default"
            className="cursor-pointer bg-accent/20 text-accent-foreground hover:bg-accent/40 border-accent/30"
            onClick={() => handleAddTag(tag)}
          >
            + {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
