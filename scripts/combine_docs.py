import os
import glob

def combine_md_files(docs_dir, output_file):
    # Get all .md files in the docs directory
    md_files = glob.glob(os.path.join(docs_dir, "*.md"))
    
    # Sort files alphabetically to ensure consistent order
    md_files.sort()
    
    # Ensure the output file is EXCLUDED from the combination process
    # Use absolute paths for a robust comparison
    output_abs_path = os.path.abspath(output_file)
    final_list = []
    
    for f in md_files:
        if os.path.abspath(f) == output_abs_path:
            continue
        final_list.append(f)
    
    # Opening with 'w' ensures the file is overwritten (replaced) every time
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for i, filepath in enumerate(final_list):
            filename = os.path.basename(filepath)
            title = filename.replace('.md', '').replace('-', ' ').title()
            
            if i > 0:
                outfile.write("\n\n---\n\n")
            
            outfile.write(f"# {title}\n\n")
            
            with open(filepath, 'r', encoding='utf-8') as infile:
                outfile.write(infile.read())
            
            print(f"Merged: {filename}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, ".."))
    docs_folder = os.path.join(project_root, "docs")
    combined_file = os.path.join(docs_folder, "combined_docs.md")
    
    if not os.path.exists(docs_folder):
        print(f"Error: Docs folder not found at {docs_folder}")
    else:
        print(f"Generating {os.path.basename(combined_file)}...")
        combine_md_files(docs_folder, combined_file)
        print(f"\nDone! All files merged into {combined_file}")
