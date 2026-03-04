from database import SessionLocal
import models
import auth_utils

db = SessionLocal()

# Check if admin exists
admin = db.query(models.User).filter(models.User.name == "admin").first()

if admin:
    print("Admin user already exists!")
    print(f"Username: admin")
    print(f"Email: {admin.email}")
    print(f"Is Admin: {admin.is_admin}")
else:
    # Create admin user
    hashed_password = auth_utils.get_password_hash("admin123")
    new_admin = models.User(
        name="admin",
        email="admin@educerts.io",
        password=hashed_password,
        is_admin=True
    )
    db.add(new_admin)
    db.commit()
    print("Admin user created successfully!")
    print("Username: admin")
    print("Password: admin123")
    print("Email: admin@educerts.io")

db.close()
