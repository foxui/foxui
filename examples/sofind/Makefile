src = index.html\
      detail.html\
      list.html\
      panorama.html\
      search.html\
      map_result.html

dist = build
asserts = css\
	  images\
	  ../../components/fox-icon/font

wck = ./node_modules/wck/bin/wck.js

all:$(asserts) $(dist)

merge:$(dist)


$(dist):$(src)
	$(wck) $^ -d build -minify n

$(asserts):$(dist)
	@cp -rf $@ $^

clean:
	@rm -rf $(dist)
	@echo  clean success

init:
	@npm install

.PHONY: all clean merge
