// import { useState } from "react";
// import { useMutation } from "@tanstack/react-query";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { queryClient, apiRequest } from "@/lib/queryClient";
// import { useToast } from "@/hooks/use-toast";
// import { isUnauthorizedError } from "@/lib/authUtils";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// interface AddConnectionModalProps {
//   onClose: () => void;
// }

// type ConnectionFormData = z.infer<typeof connectionFormSchema>;

// export default function AddConnectionModal({ onClose }: AddConnectionModalProps) {
//   const { toast } = useToast();
//   const [connectionMethod, setConnectionMethod] = useState<'manual' | 'string'>('manual');
  
//   const form = useForm<ConnectionFormData>({
//     resolver: zodResolver(connectionFormSchema),
//     defaultValues: {
//       name: '',
//       type: '',
//       host: '',
//       port: 5432,
//       database: '',
//       username: '',
//       password: '',
//       connectionString: '',
//       isActive: false,
//     },
//   });

//   const createConnectionMutation = useMutation({
//     mutationFn: async (data: ConnectionFormData) => {
//       await apiRequest("POST", "/api/connections", data);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['/api/connections'] });
//       toast({
//         title: "Success",
//         description: "Connection created successfully",
//       });
//       onClose();
//     },
//     onError: (error) => {
//       if (isUnauthorizedError(error)) {
//         toast({
//           title: "Unauthorized",
//           description: "You are logged out. Logging in again...",
//           variant: "destructive",
//         });
//         setTimeout(() => {
//           window.location.href = "/api/login";
//         }, 500);
//         return;
//       }
//       toast({
//         title: "Error",
//         description: "Failed to create connection",
//         variant: "destructive",
//       });
//     },
//   });

//   const testConnectionMutation = useMutation({
//     mutationFn: async (data: ConnectionFormData) => {
//       // Mock test connection - in real app this would test the actual connection
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       return { success: true };
//     },
//     onSuccess: () => {
//       toast({
//         title: "Test Successful",
//         description: "Connection test completed successfully",
//       });
//     },
//     onError: () => {
//       toast({
//         title: "Test Failed",
//         description: "Unable to connect to database",
//         variant: "destructive",
//       });
//     },
//   });

//   const onSubmit = (data: ConnectionFormData) => {
//     createConnectionMutation.mutate(data);
//   };

//   const handleTestConnection = () => {
//     const formData = form.getValues();
//     testConnectionMutation.mutate(formData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//         <div className="flex items-center justify-between p-6 border-b border-slate-200">
//           <h3 className="text-xl font-semibold text-slate-800">Add Database Connection</h3>
//           <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
//             <i className="fas fa-times text-xl"></i>
//           </button>
//         </div>

//         <div className="p-6">
//           {/* Connection Method Tabs */}
//           <div className="flex space-x-1 mb-6 bg-slate-100 p-1 rounded-lg">
//             <button
//               onClick={() => setConnectionMethod('manual')}
//               className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
//                 connectionMethod === 'manual'
//                   ? 'bg-white text-slate-900 shadow-sm'
//                   : 'text-slate-600 hover:text-slate-900'
//               }`}
//             >
//               Manual Setup
//             </button>
//             <button
//               onClick={() => setConnectionMethod('string')}
//               className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
//                 connectionMethod === 'string'
//                   ? 'bg-white text-slate-900 shadow-sm'
//                   : 'text-slate-600 hover:text-slate-900'
//               }`}
//             >
//               Connection String
//             </button>
//           </div>

//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//               {/* Connection Name - Always shown */}
//               <FormField
//                 control={form.control}
//                 name="name"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Connection Name</FormLabel>
//                     <FormControl>
//                       <Input placeholder="My Database Connection" {...field} value={field.value || ''} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {connectionMethod === 'manual' ? (
//                 <>
//                   {/* Database Type */}
//                   <FormField
//                     control={form.control}
//                     name="type"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Database Type</FormLabel>
//                         <Select onValueChange={field.onChange} defaultValue={field.value}>
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select Database Type" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             <SelectItem value="postgresql">PostgreSQL</SelectItem>
//                             <SelectItem value="mysql">MySQL</SelectItem>
//                             <SelectItem value="mongodb">MongoDB</SelectItem>
//                             <SelectItem value="sqlite">SQLite</SelectItem>
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   {/* Host and Port */}
//                   <div className="grid grid-cols-3 gap-4">
//                     <div className="col-span-2">
//                       <FormField
//                         control={form.control}
//                         name="host"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Host</FormLabel>
//                             <FormControl>
//                               <Input placeholder="localhost" {...field} value={field.value || ''} />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                     <FormField
//                       control={form.control}
//                       name="port"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Port</FormLabel>
//                           <FormControl>
//                             <Input 
//                               type="number" 
//                               placeholder="5432" 
//                               {...field}
//                               onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>

//                   {/* Database Name */}
//                   <FormField
//                     control={form.control}
//                     name="database"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Database Name</FormLabel>
//                         <FormControl>
//                           <Input placeholder="mydatabase" {...field} value={field.value || ''} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   {/* Username and Password */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <FormField
//                       control={form.control}
//                       name="username"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Username</FormLabel>
//                           <FormControl>
//                             <Input placeholder="username" {...field} value={field.value || ''} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name="password"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Password</FormLabel>
//                           <FormControl>
//                             <Input type="password" placeholder="••••••••" {...field} value={field.value || ''} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 </>
//               ) : (
//                 /* Connection String Form */
//                 <FormField
//                   control={form.control}
//                   name="connectionString"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Connection String</FormLabel>
//                       <FormControl>
//                         <Textarea
//                           rows={4}
//                           placeholder="postgresql://username:password@localhost:5432/database_name"
//                           {...field}
//                           value={field.value || ''}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                       <p className="text-xs text-slate-500">Enter your full database connection string</p>
//                     </FormItem>
//                   )}
//                 />
//               )}

//               {/* Actions */}
//               <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 mt-6">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={handleTestConnection}
//                   disabled={testConnectionMutation.isPending}
//                 >
//                   {testConnectionMutation.isPending ? (
//                     <>
//                       <i className="fas fa-spinner fa-spin mr-2"></i>
//                       Testing...
//                     </>
//                   ) : (
//                     'Test Connection'
//                   )}
//                 </Button>
//                 <Button type="button" variant="ghost" onClick={onClose}>
//                   Cancel
//                 </Button>
//                 <Button
//                   type="submit"
//                   disabled={createConnectionMutation.isPending}
//                 >
//                   {createConnectionMutation.isPending ? (
//                     <>
//                       <i className="fas fa-spinner fa-spin mr-2"></i>
//                       Saving...
//                     </>
//                   ) : (
//                     'Save Connection'
//                   )}
//                 </Button>
//               </div>
//             </form>
//           </Form>
//         </div>
//       </div>
//     </div>
//   );
// }

interface AddConnectionModalProps {
  onClose: () => void
}

export default function AddConnectionModal(onClose: AddConnectionModalProps) {
  return <div>
    <button onClick={() => onClose}/>
  </div>
}