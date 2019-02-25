## Setting up debugging 

It is necessary to install 2 gems:  

> gem 'ruby-debug-ide'  
> gem 'debase'

[Documentation for ebugging from VSCode](https://github.com/rubyide/vscode-ruby/wiki/2.-Launching-from-VS-Code) did not work for me. I had to 
[Follow mitch's answer](
https://stackoverflow.com/questions/51722136/how-do-you-run-and-debug-ruby-on-rails-from-visual-studio-code/54477794) to finally get it to work.

Simple web server. Useful for reading the template documenttion
```ruby
ruby -run -ehttpd . -p8000
```

## Webpacker

[misc. rake commands](https://bloggie.io/@_ChristineOo/housekeeping-the-webpacker-packs-folder). The command to clear the packs directory is in here.

[setup walk-thru](https://medium.com/@coorasse/goodbye-sprockets-welcome-webpacker-3-0-ff877fb8fa79)

if you do `~` search is relative node_modules.