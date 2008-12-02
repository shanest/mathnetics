#
# Mathnetics Copyright (c) 2008 Shane Steinert-Threlkeld
# Dual-licensed under the MIT and GNU GPL Licenses.
# For more information, see LICENSE file
#

all: 

clean:
	rm -r dist

min:

archive:
	rm -rf mathnetics
	mkdir mathnetics
	cp -r src/* mathnetics
	tar -czvf mathnetics-0.1.0.tar.gz *.txt README mathnetics --exclude=".*"

documentation:
	ant -f build.xml
