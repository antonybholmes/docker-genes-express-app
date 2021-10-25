pwd=`pwd`
name=`basename ${pwd}`

docker run -p 8080:8080 -d --name ${name} --network host ${name} 
