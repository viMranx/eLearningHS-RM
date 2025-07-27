ALTER TABLE Thema 
RENAME COLUMN Name TO ThemaName;

ALTER TABLE Material 
RENAME COLUMN Name TO MaterialName;

ALTER TABLE Inhalt 
RENAME COLUMN Name TO InhaltName;

ALTER Table InhaltBuch
MODIFY COLUMN ISBN varchar(255);  
