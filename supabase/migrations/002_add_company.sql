-- Optional "your name" / "your company" attribution on submissions.
-- display_name becomes optional so a submitter can give just a company
-- with no name (previously required, blocking that combination).

alter table users alter column display_name drop not null;
alter table users add column company text;
