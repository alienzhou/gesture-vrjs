if [ $1 = 'fis3' ]; then
    echo 'fis3 release mode'
    yog2 release --fis3 -wd ../base debug
else
    echo 'fis release mode'
    yog2 release -pwd debug
fi