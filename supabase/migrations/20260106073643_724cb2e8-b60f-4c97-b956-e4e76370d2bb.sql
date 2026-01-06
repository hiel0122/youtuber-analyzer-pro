-- copy_count 컬럼 추가
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS copy_count INTEGER DEFAULT 0;

-- likes, views 컬럼 삭제
ALTER TABLE prompts 
DROP COLUMN IF EXISTS likes,
DROP COLUMN IF EXISTS views;

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS public.increment_likes(UUID);
DROP FUNCTION IF EXISTS public.decrement_likes(UUID);
DROP FUNCTION IF EXISTS public.increment_views(UUID);

-- increment_copy_count 함수 생성
CREATE OR REPLACE FUNCTION public.increment_copy_count(prompt_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.prompts
    SET copy_count = copy_count + 1
    WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;