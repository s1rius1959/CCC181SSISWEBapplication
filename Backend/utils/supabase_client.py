import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None


def rename_student_image(old_student_id, new_student_id):
    """
    Rename student image file in Supabase when student ID changes.
    Returns the new image URL if successful, None otherwise.
    """
    if not supabase:
        print("Supabase client not configured")
        return None
    
    try:
        # List all files in students folder
        files = supabase.storage.from_('avatars').list('students')
        
        # Find the old file
        old_file = None
        for file in files:
            if file['name'].startswith(f"{old_student_id}."):
                old_file = file['name']
                break
        
        if not old_file:
            print(f"No image found for student ID {old_student_id}")
            return None
        
        # Get the file extension
        file_ext = old_file.split('.')[-1]
        old_path = f"students/{old_file}"
        new_file = f"{new_student_id}.{file_ext}"
        new_path = f"students/{new_file}"
        
        # Download the old file
        file_data = supabase.storage.from_('avatars').download(old_path)
        
        if not file_data:
            print(f"Failed to download {old_path}")
            return None
        
        # Upload with new name (upsert will replace if exists)
        upload_result = supabase.storage.from_('avatars').upload(
            new_path,
            file_data,
            {
                'content-type': f'image/{file_ext}',
                'cache-control': '3600',
                'upsert': 'true'
            }
        )
        
        # Delete the old file
        supabase.storage.from_('avatars').remove([old_path])
        
        # Get the new public URL
        public_url = supabase.storage.from_('avatars').get_public_url(new_path)
        
        print(f"Successfully renamed image from {old_file} to {new_file}")
        return public_url
        
    except Exception as e:
        print(f"Error renaming student image: {str(e)}")
        return None


def delete_student_image(student_id):
    """
    Delete student image file from Supabase.
    Returns True if successful, False otherwise.
    """
    if not supabase:
        print("Supabase client not configured")
        return False
    
    try:
        # List all files in students folder
        files = supabase.storage.from_('avatars').list('students')
        
        # Find the file
        file_to_delete = None
        for file in files:
            if file['name'].startswith(f"{student_id}."):
                file_to_delete = file['name']
                break
        
        if not file_to_delete:
            print(f"No image found for student ID {student_id}")
            return False
        
        # Delete the file
        supabase.storage.from_('avatars').remove([f"students/{file_to_delete}"])
        
        print(f"Successfully deleted image {file_to_delete}")
        return True
        
    except Exception as e:
        print(f"Error deleting student image: {str(e)}")
        return False
