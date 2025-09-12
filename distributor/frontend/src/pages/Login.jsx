// src/pages/Login.jsx
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Building2, User, Lock } from 'lucide-react';
import { useLoginMutation } from '../services/loginApi';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAuth } from '../redux/slices/authSlice';
import authSlice from '../redux/slices/authSlice';


const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const [loginApi] = useLoginMutation();

  const onSubmit = async (data) => {
    setError('');

    try {
      const res = await loginApi(data).unwrap(); // ✅ Call login API

      if (res.status) {
        // ✅ Store user + distributor in Redux
        dispatch(setAuth({ user: res.user, distributor: res.distributor }));

        // ✅ Redirect to dashboard
        navigate('/dashboard');
      } else {
        navigate('/login');
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      setError(err?.data?.message || 'Invalid username or password. Please try again.');
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-hero">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Branding */}
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto border bg-white/10 rounded-2xl backdrop-blur-sm border-white/20">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">PharmaDistri</h1>
            <p className="text-white/80">Telangana State Licensed Distributor Portal</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl backdrop-blur-md bg-white/95 border-white/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your distributor account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    {...register('username', {
                      required: 'Username is required',
                    })}
                    className="pl-10"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...register('password', {
                      required: 'Password is required',
                    })}
                    className="pl-10"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Global Error (from API) */}
              {error && (
                <div className="p-3 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                variant="medical"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <Separator />

            <div className="space-y-3 text-sm text-center">
              <Link to="/register" className="text-primary hover:underline">
                Register New Distributor
              </Link>
              <br />
              <Link to="/forgot-password" className="text-muted-foreground hover:underline">
                Forgot Password?
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-sm text-center text-white/60">
          <p>Licensed for Telangana State Pharmaceutical Distribution</p>
          <p className="mt-1">Compliant with Drug License Act 20B/21B</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
