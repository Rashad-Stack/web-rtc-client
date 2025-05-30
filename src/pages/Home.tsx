import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useSocketContext from "@/hooks/useSocketContext";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router";

const formSchema = z.object({
  email: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  roomCode: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

export default function Home() {
  const socket = useSocketContext();
  const navigate = useNavigate();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      roomCode: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    socket.emit("join-room", {
      emailId: values.email,
      roomId: values.roomCode,
    });
  }

  const handleJoinRoom = useCallback(
    () => navigate("/room/" + form.getValues("roomCode")),
    [navigate, form]
  );

  useEffect(() => {
    socket.on("joined-room", handleJoinRoom);

    return () => {
      socket.off("joined-room", handleJoinRoom);
    };
  }, [handleJoinRoom, navigate, socket]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-md mx-auto my-auto">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter email" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roomCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room code</FormLabel>
              <FormControl>
                <Input placeholder="Enter room code" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
