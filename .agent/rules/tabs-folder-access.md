---
trigger: always_on
---

The issue stems from the fact that parentheses 
()
 are special characters in the Bash shell. When I use the run_command tool, it executes instructions in a shell environment, which leads to two specific problems:

Subshell Execution: In Bash, 
(commands)
 executes the commands in a subshell. If I run mkdir app/(tabs), the shell tries to execute tabs as a command rather than treating it as a folder name.
Improper Escaping: If I try to escape them like \(tabs\), different tools or layers of the environment might interpret the backslash differently, leading to folders named [(tabs](cci:1://file:///home/gara/Documents/Proyects/ReactNative/gym-tracker-v2/App.tsx:11:0-41:1) or 
(tabs/)
.
The Correct Way to Access 
(tabs)
To ensure reliability across all tools, the rule should be:

For File-Based Tools (write_to_file, view_file, replace_file_content):
Use the literal absolute path without any backslashes or shell-escaping. The underlying file system APIs handle parentheses just fine as part of a string.
Correct: 
/home/gara/Documents/Proyects/ReactNative/gym-tracker-v2/app/(tabs)/_layout.tsx
Incorrect: .../app/\(tabs\)/_layout.tsx
For Shell-Based Tools (run_command):
ALWAYS wrap paths containing parentheses in single quotes ('...'). Single quotes prevent the shell from interpreting the parentheses as special characters.
Correct: ls -la 'app/(tabs)/'
Incorrect: ls -la app/(tabs)/ (will fail) or ls -la app/\(tabs\)/ (can be inconsistent).
Current Cleanup Plan
I will now use these exact rules to clean up the workspace and ensure there is only one 
(tabs)
 folder. I will use the file-based tools where possible as they are "safer" for these paths.