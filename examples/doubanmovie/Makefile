src = index.html\
      movie.html\
      stars.html\
      usrank.html\
      movieinfo.html\
      imagegallery.html

dist = build
asserts = data\
	  images\
	  ../../components/fox-icon/font

wck = node_modules/wck/bin/wck.js

all:$(asserts) $(dist)

$(dist):$(src)
	$(wck) $^


$(asserts):$(dist)
	@cp -rf $@ $^


clean:
	@rm -rf $(dist)
	@echo  clean success

init:
	$(npm) install

.PHONY: clean
