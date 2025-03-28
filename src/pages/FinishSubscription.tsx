import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CreditCard, 
  Lock, 
  Package, 
  BookOpen, 
  UserRound, 
  CalendarCheck, 
  Rocket, 
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

const formSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().optional(),
  address: z.string().min(5, "L'adresse doit être complète"),
  postalCode: z.string().min(5, "Code postal invalide"),
  city: z.string().min(2, "Ville invalide"),
  planType: z.enum(["monthly", "yearly"]),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions générales"
  })
});

type FormValues = z.infer<typeof formSchema>;

const FinishSubscription = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const childName = "Thomas";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      postalCode: "",
      city: "",
      planType: "monthly",
      acceptTerms: false
    }
  });

  const handleGoBack = () => {
    navigate('/pret-a-demarrer');
  };

  const onSubmit = (data: FormValues) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      toast.success("Abonnement confirmé ! Votre aventure commence !");
      navigate("/confirmation-abonnement");
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mcf-cream to-white py-12">
      <div className="container px-4 mx-auto max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-mcf-orange-dark hover:bg-mcf-amber/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>

        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-mcf-orange-dark mb-3">
            💳 Finaliser mon abonnement
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-2 max-w-2xl mx-auto">
            L'aventure commence maintenant ! 🚀
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Finalisez votre abonnement pour recevoir chaque mois un livre magique personnalisé ✨
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="border-2 border-mcf-amber/30 sticky top-4">
              <CardHeader className="bg-mcf-amber/10 border-b border-mcf-amber/20">
                <CardTitle className="text-xl text-mcf-orange-dark flex items-center gap-2">
                  <Package className="h-5 w-5" /> Votre abonnement
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <SubscriptionFeature 
                    icon={<BookOpen />} 
                    text="1 livre personnalisé par mois" 
                  />
                  <SubscriptionFeature 
                    icon={<UserRound />} 
                    text={`Adapté au profil de ${childName}`} 
                  />
                  <SubscriptionFeature 
                    icon={<Package />} 
                    text="Envoi à domicile" 
                  />
                  <SubscriptionFeature 
                    icon={<CalendarCheck />} 
                    text="Accès aux éditions spéciales + espace famille" 
                  />
                </div>

                <div className="mt-6 pt-4 border-t border-mcf-amber/20">
                  <h3 className="font-semibold text-mcf-orange-dark mb-2">Paiement sécurisé</h3>
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-white p-1 rounded border border-gray-200">
                      <img src="/placeholder.svg" alt="Visa" className="h-6" />
                    </div>
                    <div className="bg-white p-1 rounded border border-gray-200">
                      <img src="/placeholder.svg" alt="MasterCard" className="h-6" />
                    </div>
                    <div className="bg-white p-1 rounded border border-gray-200">
                      <img src="/placeholder.svg" alt="ApplePay" className="h-6" />
                    </div>
                    <div className="bg-white p-1 rounded border border-gray-200 flex items-center px-2 gap-1">
                      <Lock className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-500">Sécurisé</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card className="border border-gray-200">
                  <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-xl text-mcf-orange-dark flex items-center gap-2">
                      <CreditCard className="h-5 w-5" /> Choix de formule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="planType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-4"
                            >
                              <div className="flex items-start gap-4 p-4 border rounded-lg hover:border-mcf-orange transition-colors">
                                <RadioGroupItem value="monthly" id="monthly" />
                                <div className="grid gap-1">
                                  <label
                                    htmlFor="monthly"
                                    className="font-semibold text-mcf-orange-dark text-lg cursor-pointer"
                                  >
                                    Mensuel – 9,90€ / mois
                                  </label>
                                  <p className="text-sm text-gray-600">
                                    Résiliable à tout moment, sans engagement
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-4 p-4 border rounded-lg hover:border-mcf-orange transition-colors bg-mcf-amber/5">
                                <RadioGroupItem value="yearly" id="yearly" />
                                <div className="grid gap-1">
                                  <label
                                    htmlFor="yearly"
                                    className="font-semibold text-mcf-orange-dark text-lg cursor-pointer"
                                  >
                                    Annuel – 99€ / an
                                  </label>
                                  <p className="text-sm text-gray-600">
                                    <span className="text-mcf-orange-dark font-semibold">2 mois offerts</span> - meilleure offre !
                                  </p>
                                </div>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-xl text-mcf-orange-dark flex items-center gap-2">
                      <UserRound className="h-5 w-5" /> Vos coordonnées
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom</FormLabel>
                            <FormControl>
                              <Input placeholder="Votre prénom" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                              <Input placeholder="Votre nom" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="votre.email@exemple.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone (optionnel)</FormLabel>
                            <FormControl>
                              <Input placeholder="06 XX XX XX XX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse</FormLabel>
                            <FormControl>
                              <Input placeholder="Adresse de livraison" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code postal</FormLabel>
                            <FormControl>
                              <Input placeholder="Code postal" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ville</FormLabel>
                              <FormControl>
                                <Input placeholder="Ville" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-xl text-mcf-orange-dark flex items-center gap-2">
                      <CreditCard className="h-5 w-5" /> Informations de paiement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4 p-2 bg-gray-50 rounded-md">
                      <ShieldCheck className="text-green-500 h-5 w-5" />
                      <p className="text-sm text-gray-600">Paiement 100% sécurisé</p>
                    </div>
                    
                    <div className="border rounded-md p-4 bg-white">
                      <p className="font-medium mb-4">Carte bancaire</p>
                      <div className="space-y-4">
                        <Input 
                          placeholder="Numéro de carte" 
                          className="bg-white" 
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input 
                            placeholder="MM/AA" 
                            className="bg-white" 
                          />
                          <Input 
                            placeholder="CVC" 
                            className="bg-white" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <FormField
                        control={form.control}
                        name="acceptTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                J'accepte les <a href="/conditions-generales" className="text-mcf-orange hover:underline">conditions générales de vente</a>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="justify-center pt-2 pb-6">
                    <Button 
                      type="submit"
                      disabled={isProcessing}
                      className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-5 px-8 rounded-full shadow-lg hover:shadow-xl transition-all w-full md:w-auto md:min-w-64 text-lg flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Traitement en cours...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-5 w-5" /> 
                          Je confirme mon abonnement et commence l'aventure ! 🚀
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubscriptionFeature = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex items-start gap-3">
    <div className="text-mcf-orange shrink-0 mt-0.5">
      {icon}
    </div>
    <span className="text-gray-700">{text}</span>
  </div>
);

export default FinishSubscription;
