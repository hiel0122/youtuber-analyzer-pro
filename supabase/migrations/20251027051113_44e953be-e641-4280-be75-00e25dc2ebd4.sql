-- Add comments column to youtube_videos table
ALTER TABLE public.youtube_videos
ADD COLUMN IF NOT EXISTS comments bigint DEFAULT 0;

-- Update upsert_videos function to handle comments
CREATE OR REPLACE FUNCTION public.upsert_videos(p_rows jsonb)
RETURNS integer
LANGUAGE plpgsql
AS $function$
declare
  r jsonb;
  n int := 0;
begin
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    return 0;
  end if;

  for r in select * from jsonb_array_elements(p_rows)
  loop
    insert into public.youtube_videos
      (video_id, channel_id, topic, title, presenter, views, likes, dislikes, upload_date, duration, url, comments, created_at)
    values
      (
        r->>'video_id',
        r->>'channel_id',
        nullif(r->>'topic',''),
        r->>'title',
        nullif(r->>'presenter',''),
        nullif(r->>'views','0')::bigint,
        nullif(r->>'likes','')::bigint,
        nullif(r->>'dislikes','')::bigint,
        (r->>'upload_date')::date,
        r->>'duration',
        r->>'url',
        coalesce(nullif(r->>'comments','')::bigint, 0),
        now()
      )
    on conflict (video_id) do update set
      title   = excluded.title,
      views   = excluded.views,
      likes   = excluded.likes,
      dislikes= excluded.dislikes,
      duration= excluded.duration,
      url     = excluded.url,
      comments= excluded.comments;

    n := n + 1;
  end loop;

  return n;
end $function$;