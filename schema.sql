ALTER TABLE street_ratings ADD COLUMN segment_id integer;
ALTER TABLE street_ratings ADD COLUMN rating integer;
ALTER TABLE street_ratings ADD COLUMN recorded_by varchar(50);
ALTER TABLE street_ratings ADD COLUMN collected date;
ALTER TABLE street_ratings ADD COLUMN comments text;
