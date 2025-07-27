# Backup storage directory 
backupfolder=/root/backups

# MySQL user
user=root
# MySQL password
password=PASSWORT
# Number of days to store the backup 
keep_day=30 
# Create Backup
mkdir -p $backupfolder
# Create Files
sqlfile=$backupfolder/wp-$(date +%d-%m-%Y_%H-%M-%S).sql
zipfile=$backupfolder/wp-$(date +%d-%m-%Y_%H-%M-%S).zip 
# Create a backup 
sudo mysqldump -u $user -p$password --routines wp > $sqlfile 

if [ $? -eq 0 ]; then
  echo 'Sql dump created' 
else
  echo 'mysqldump return non-zero code'
  exit 
fi 
# Compress backup 
zip $zipfile $sqlfile 
if [ $? -eq 0 ]; then
  echo 'The backup was successfully compressed' 
else
  echo 'Error compressing backup'
  exit 
fi 
rm $sqlfile 
echo $zipfile
# Delete old backups 
find $backupfolder -mtime +$keep_day -delete