import { supabase } from "../utils/supabase.js";
//=======================================
// Signup
//=======================================

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // 2. Create user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name
                }
            }
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        if (!data.user) {
            return res.status(400).json({
                success: false,
                message: "User was not created"
            });
        }

        // 3. Create user in users table
        const { data: newUser, error: dbError } = await supabase
            .from("users")
            .insert({
                id: data.user.id,
                name: name,
                email: email,
                profile_completed: false
            })
            .select("id, name, email, profile_completed")
            .single();

        if (dbError) {
            return res.status(400).json({
                success: false,
                message: dbError.message
            });
        }

        // 4. Send response
        return res.status(201).json({
            success: true,
            message: "Signup successful. Check your email.",
            user: newUser,
            session: data.session
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

//======================================
//Login
//======================================

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email||!password){
            return res.status(400).json({
                success:false,
                message:"Email and password are required"
            })
        }
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        if(!data.user){
            return res.status(400).json({
                success:false,
                message:"Unable to find authenticate user"
            })
        }

        const{data:profile,error:profileError}=await supabase
            .from("users")
            .select("id,name,email,profile_completed")
            .eq("id",data.user.id)
            .single();
        if(profileError){
            return res.status(500).json({
                success: false,
                message: profileError.message
            });
        }
        return res.status(200).json({
            success: true,
            message: "Login Successful",
            session: data.session,
            user: profile
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        await supabase.auth.signOut();
        res.status(200).json({
            sucess: true,
            message: "Logged Out"
        })
    }
    catch (err) {
        return res.status(500).json({
            sucess: false,
            message: err.message
        })
    }
}

//======================================
// Forgot password (send reset email)
//======================================

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: process.env.CLIENT_URL || "http://localhost:5173/reset-password",
        });

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(200).json({ success: true, message: "Reset instructions sent to email", data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};