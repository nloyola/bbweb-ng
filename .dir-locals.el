((nil . ((fill-column . 110)
         (eval . (progn
                   (use-package nl-angular
                     :load-path "~/.emacs.d"
                     :init
                     (require 'tide))
                   (setq dumb-jump-default-project (projectile-project-root)))))))
