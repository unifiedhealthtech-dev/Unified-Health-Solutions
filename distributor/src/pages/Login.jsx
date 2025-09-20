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
import { Building2, Lock } from 'lucide-react';
import { useLoginMutation } from '../services/loginApi';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAuth } from '../redux/slices/authSlice';

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
      login_id: '',
      password: '',
    },
  });

  const [loginApi] = useLoginMutation();

  const onSubmit = async (data) => {
    setError('');

    try {
      const res = await loginApi(data).unwrap(); // Call login API

      if (res.status) {
        // Store user + distributor in Redux
        dispatch(setAuth({ 
          user: {
            distributor_id: res.user.distributor_id,
            phone: res.user.phone,
            role: res.user.role
          },
          distributor: res.distributor
        }));

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      setError(err?.data?.message || 'Invalid Distributor ID / Phone or password.');
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
              Sign in using Distributor ID or Phone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Login ID Field */}
              <div className="space-y-2">
                <Label htmlFor="login_id">Distributor ID or Phone</Label>
                <Input
                  id="login_id"
                  type="text"
                  placeholder="Enter Distributor ID or Phone"
                  {...register('login_id', { required: 'Login ID is required' })}
                />
                {errors.login_id && (
                  <p className="mt-1 text-sm text-red-500">{errors.login_id.message}</p>
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
                    {...register('password', { required: 'Password is required' })}
                    className="pl-10"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Global Error */}
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
