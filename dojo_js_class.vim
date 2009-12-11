" Don't reload the NERDTree and grep options...
if !exists('g:dojoclass_loaded')
    let g:dojoclass_loaded = 1

    " Set the EasyGrep options
    let g:EasyGrepRecursive = 1
    source $HOME/.vim/plugin/EasyGrep.vim
    " Grep all the files
    execute "normal \\voaq"

    " Open NERDTree
    NERDTree
endif
