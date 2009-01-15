#
# Mathnetics Copyright (c) 2008 Shane Steinert-Threlkeld
# Dual-licensed under the MIT and GNU GPL Licenses.
# For more information, see included text files
#

all: documentation archive clean

min:

archive:
	rm -rf mathnetics
	mkdir mathnetics
	cp -r src/* mathnetics
	tar -czvf mathnetics-0.1.0.tar.gz *.txt README mathnetics --exclude=".*"

clean:
	rm -rf mathnetics

documentation:
	ant -f build.xml
