CREATE TABLE NutzerThemenNachverfolgung (
	ntn_id INT NOT NULL AUTO_INCREMENT,
	ntn_NutzerID INT,
	ntn_ThemaID INT,
	ntn_letzterBesuch DATETIME,	
	PRIMARY KEY (ntn_id),
	FOREIGN KEY (ntn_NutzerID) REFERENCES Nutzer(NutzerID),
	FOREIGN KEY (ntn_ThemaID) REFERENCES Thema(ThemaID)	
);

INSERT INTO NutzerThemenNachverfolgung (ntn_NutzerID, ntn_ThemaID, ntn_letzterBesuch) VALUES
(1, 1, "2022-12-05 10:10:10"),
(1, 4, "2022-12-05 09:50:00"),
(1, 5, "2022-12-06 12:20:10"),
(1, 13, "2022-11-10 20:10:10"),
(2, 3, "2022-12-05 10:12:10"),
(2, 5, "2022-12-05 10:15:10"),
(2, 10, "2022-12-05 10:20:10");

CREATE TABLE NutzerMaterialNachverfolgung (
	ntn_id INT NOT NULL AUTO_INCREMENT,
	ntn_NutzerID INT,
	ntn_MaterialID INT,
	ntn_letzterBesuch DATETIME,	
	PRIMARY KEY (ntn_id),
	FOREIGN KEY (ntn_NutzerID) REFERENCES Nutzer(NutzerID),
	FOREIGN KEY (ntn_MaterialID) REFERENCES Material(MaterialID)	
);

INSERT INTO NutzerMaterialNachverfolgung (ntn_NutzerID, ntn_MaterialID, ntn_letzterBesuch) VALUES
(1, 1, "2022-12-05 10:10:10"),
(1, 5, "2022-12-06 12:20:10"),
(1, 7, "2022-11-10 20:10:10"),
(2, 1, "2022-12-05 10:12:10"),
(2, 6, "2022-12-05 10:15:10"),
(2, 7, "2022-12-05 10:20:10"),
(1, 9, "2022-12-04 10:10:10"),
(1, 12, "2022-12-02 12:20:10"),
(1, 15, "2022-11-09 20:10:10");

CREATE TABLE NutzerSuchen (
	ns_id INT NOT NULL AUTO_INCREMENT,
	ns_NutzerID INT,
	ns_suche VARCHAR(255),
	ns_zeitstempel DATETIME DEFAULT CURRENT_TIMESTAMP,	
	PRIMARY KEY (ns_id),
	FOREIGN KEY (ns_NutzerID) REFERENCES Nutzer(NutzerID)
);

INSERT INTO NutzerSuchen (ns_NutzerID, ns_suche) VALUES
(6, "it"), (6, "prog"), (6, "#C java"), (6, "baum der lehr");
