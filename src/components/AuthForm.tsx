import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { FormField } from './FormField';
import { loginSchema, type LoginFormData } from '../lib/validations';
import { authService } from '../lib/api';

interface AuthFormProps {
  onSuccess?: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await authService.login(data);
      toast.success('Login successful!');

      if (onSuccess) onSuccess();
      window.location.href =
        result.user?.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard';
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Authentication failed';
      toast.error(message);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Masuk menggunakan akun yang dibuat oleh super admin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="your@email.com"
            register={register}
            errors={errors}
            required
            disabled={isSubmitting}
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            register={register}
            errors={errors}
            required
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Loading...' : 'Login'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
