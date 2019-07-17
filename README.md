# README

#### Debugging ####
I debug using rdebug-ide and vscode. The commandline to initiate an rdebug-ide session is:  
`bundle exec rdebug-ide --debug --host 0.0.0.0 --port 1234 -- bin/rails s -p 3001 -b 0.0.0.0`

[Debugging Recipes from Microsoft](https://github.com/microsoft/vscode-recipes/tree/master/debugging-Ruby-on-Rails)


#### Deployment ####

make sure the RESUME_USER environment variable is set